import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Many-to-Many link between Playlist and Track
playlist_tracks = Table(
    'playlist_tracks',
    Base.metadata,
    Column('playlist_id', String, ForeignKey('playlists.id', ondelete='CASCADE'), primary_key=True),
    Column('track_id', String, ForeignKey('tracks.id', ondelete='CASCADE'), primary_key=True)
)

# --- SQLAlchemy Database Models ---

class DBTrack(Base):
    __tablename__ = 'tracks'

    id = Column(String, primary_key=True)
    video_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    album = Column(String, nullable=True)
    duration_seconds = Column(Integer, default=0)
    year = Column(Integer, nullable=True)
    genre = Column(String, default="Desconhecido")
    subgenre = Column(String, nullable=True)
    mood = Column(String, default="Neutro")
    energy = Column(String, default="Média") # Baixa, Média, Alta
    tempo_bpm = Column(Integer, default=120)
    voice_type = Column(String, default="Banda") # Masculina, Feminina, Banda, Instrumental, Acústica, Remix, Ao Vivo, Lo-fi, Cover
    decade = Column(String, default="2020s")
    language = Column(String, default="Português")
    themes_json = Column(Text, default="[]") # JSON list of themes (Viagem, Academia, Relaxar, etc)
    cover_url = Column(String, nullable=True)
    popularity = Column(Integer, default=50)
    is_favorite = Column(Boolean, default=False)
    play_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    playlists = relationship('DBPlaylist', secondary=playlist_tracks, back_populates='tracks')

    @property
    def themes(self) -> List[str]:
        try:
            return json.loads(self.themes_json or "[]")
        except Exception:
            return []

    @themes.setter
    def themes(self, val: List[str]):
        self.themes_json = json.dumps(val or [])


class DBPlaylist(Base):
    __tablename__ = 'playlists'

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    original_title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    cover_url = Column(String, nullable=True)
    category = Column(String, default="Geral") # Academia, Viagem, Relaxar, Decada, etc.
    is_organized = Column(Boolean, default=False)
    song_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tracks = relationship('DBTrack', secondary=playlist_tracks, back_populates='playlists')


class DBAuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(String, primary_key=True)
    action_type = Column(String, nullable=False) # MOVE_TRACK, RENAME_PLAYLIST, MERGE_PLAYLISTS, DELETE_DUPLICATE
    user_id = Column(String, default="user_default")
    timestamp = Column(DateTime, default=datetime.utcnow)
    target_type = Column(String, nullable=False) # PLAYLIST, TRACK, DUPLICATE
    target_id = Column(String, nullable=False)
    description = Column(String, nullable=False)
    before_state_json = Column(Text, nullable=True)
    after_state_json = Column(Text, nullable=True)
    is_reverted = Column(Boolean, default=False)


class DBUserSettings(Base):
    __tablename__ = 'user_settings'

    id = Column(String, primary_key=True, default="default")
    theme = Column(String, default="dark")
    language = Column(String, default="pt-BR")
    ai_model = Column(String, default="gpt-4o-mini")
    temperature = Column(Float, default=0.7)
    suggestion_limit = Column(Integer, default=20)
    auto_sync = Column(Boolean, default=True)
    sync_time = Column(String, default="03:00")
    google_connected = Column(Boolean, default=True)
    google_user_email = Column(String, default="usuario@gmail.com")
    updated_at = Column(DateTime, default=datetime.utcnow)


class DBUserFeedback(Base):
    __tablename__ = 'user_feedback'

    id = Column(Integer, primary_key=True, autoincrement=True)
    track_id = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    genre = Column(String, nullable=True)
    moved_from_playlist = Column(String, nullable=True)
    moved_to_playlist = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# --- Pydantic Data Transfer Schemas ---

class TrackSchema(BaseModel):
    id: str
    video_id: Optional[str] = None
    title: str
    artist: str
    album: Optional[str] = None
    duration_seconds: int = 0
    year: Optional[int] = None
    genre: str = "Desconhecido"
    subgenre: Optional[str] = None
    mood: str = "Neutro"
    energy: str = "Média"
    tempo_bpm: int = 120
    voice_type: str = "Banda"
    decade: str = "2020s"
    language: str = "Português"
    themes: List[str] = Field(default_factory=list)
    cover_url: Optional[str] = None
    popularity: int = 50
    is_favorite: bool = False
    play_count: int = 0

    class Config:
        from_attributes = True


class PlaylistSchema(BaseModel):
    id: str
    title: str
    original_title: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    category: str = "Geral"
    is_organized: bool = False
    song_count: int = 0
    tracks: List[TrackSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True


class PreviewMoveOperation(BaseModel):
    playlist_id: str
    playlist_title: str
    added_tracks: List[TrackSchema] = Field(default_factory=list)
    removed_tracks: List[TrackSchema] = Field(default_factory=list)
    summary: str


class RenameSuggestionSchema(BaseModel):
    playlist_id: str
    current_name: str
    suggested_name: str
    reason: str
    suggested_description: str


class DuplicateGroupSchema(BaseModel):
    id: str
    primary_track: TrackSchema
    duplicates: List[TrackSchema]
    similarity_score: float
    reason: str


class AuditLogSchema(BaseModel):
    id: str
    action_type: str
    timestamp: datetime
    target_type: str
    target_id: str
    description: str
    is_reverted: bool = False

    class Config:
        from_attributes = True


class UserSettingsSchema(BaseModel):
    theme: str = "dark"
    language: str = "pt-BR"
    ai_model: str = "gpt-4o-mini"
    temperature: float = 0.7
    suggestion_limit: int = 20
    auto_sync: bool = True
    sync_time: str = "03:00"
    google_connected: bool = True
    google_user_email: str = "usuario@gmail.com"

    class Config:
        from_attributes = True
