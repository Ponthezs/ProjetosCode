import os
import json
import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.domain.models import Base, DBTrack, DBPlaylist, DBUserSettings, DBAuditLog, DBUserFeedback

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./musicmind.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if settings exist, otherwise create default
        settings = db.query(DBUserSettings).filter(DBUserSettings.id == "default").first()
        if not settings:
            settings = DBUserSettings(
                id="default",
                theme="dark",
                language="pt-BR",
                ai_model="gpt-4o-mini",
                temperature=0.7,
                suggestion_limit=20,
                auto_sync=True,
                sync_time="03:00",
                google_connected=True,
                google_user_email="musico.ai@gmail.com"
            )
            db.add(settings)
            db.commit()

        # Seed rich initial tracks and playlists if empty
        if db.query(DBTrack).count() == 0:
            seed_initial_data(db)

    finally:
        db.close()


def seed_initial_data(db: Session):
    print("Seeding initial rich YouTube Music library data...")
    
    sample_tracks = [
        # Track 1
        DBTrack(
            id="tr_1", video_id="v_1", title="Blinding Lights", artist="The Weeknd",
            album="After Hours", duration_seconds=200, year=2020, genre="Synthpop",
            subgenre="80s Synth", mood="Energético", energy="Alta", tempo_bpm=171,
            voice_type="Masculina", decade="2020s", language="Inglês",
            themes_json=json.dumps(["Academia", "Festa", "Viagem"]),
            cover_url="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80",
            popularity=98, is_favorite=True, play_count=142
        ),
        # Track 2
        DBTrack(
            id="tr_2", video_id="v_2", title="Starboy", artist="The Weeknd",
            album="Starboy", duration_seconds=230, year=2016, genre="Pop / R&B",
            subgenre="Electropop", mood="Motivado", energy="Alta", tempo_bpm=186,
            voice_type="Masculina", decade="2010s", language="Inglês",
            themes_json=json.dumps(["Academia", "Viagem", "Festa"]),
            cover_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80",
            popularity=95, is_favorite=True, play_count=110
        ),
        # Track 3
        DBTrack(
            id="tr_3", video_id="v_3", title="As It Was", artist="Harry Styles",
            album="Harry's House", duration_seconds=167, year=2022, genre="Indie Pop",
            subgenre="New Wave", mood="Nostálgico", energy="Média", tempo_bpm=174,
            voice_type="Masculina", decade="2020s", language="Inglês",
            themes_json=json.dumps(["Viagem", "Relaxar", "Trabalho"]),
            cover_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
            popularity=94, is_favorite=False, play_count=89
        ),
        # Track 4
        DBTrack(
            id="tr_4", video_id="v_4", title="Bohemian Rhapsody", artist="Queen",
            album="A Night at the Opera", duration_seconds=354, year=1975, genre="Rock",
            subgenre="Progressive Rock", mood="Épico", energy="Alta", tempo_bpm=143,
            voice_type="Banda", decade="1970s", language="Inglês",
            themes_json=json.dumps(["Viagem", "Nostalgia"]),
            cover_url="https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80",
            popularity=99, is_favorite=True, play_count=230
        ),
        # Track 5 (Duplicate version of track 4)
        DBTrack(
            id="tr_5", video_id="v_5", title="Bohemian Rhapsody (Remastered 2011)", artist="Queen",
            album="A Night at the Opera (Deluxe)", duration_seconds=355, year=2011, genre="Rock",
            subgenre="Classic Rock", mood="Épico", energy="Alta", tempo_bpm=143,
            voice_type="Banda", decade="1970s", language="Inglês",
            themes_json=json.dumps(["Viagem", "Nostalgia"]),
            cover_url="https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80",
            popularity=88, is_favorite=False, play_count=15
        ),
        # Track 6
        DBTrack(
            id="tr_6", video_id="v_6", title="Evidências", artist="Chitãozinho & Xororó",
            album="Cowboy do Asfalto", duration_seconds=279, year=1990, genre="Sertanejo",
            subgenre="Sertanejo Clássico", mood="Romântica", energy="Média", tempo_bpm=115,
            voice_type="Masculina", decade="1990s", language="Português",
            themes_json=json.dumps(["Festa", "Romântica", "Nostalgia"]),
            cover_url="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&q=80",
            popularity=97, is_favorite=True, play_count=180
        ),
        # Track 7
        DBTrack(
            id="tr_7", video_id="v_7", title="Anunciação", artist="Alceu Valença",
            album="Anjo Avulso", duration_seconds=205, year=1983, genre="MPB",
            subgenre="Forró / Folk", mood="Feliz", energy="Alta", tempo_bpm=130,
            voice_type="Masculina", decade="1980s", language="Português",
            themes_json=json.dumps(["Viagem", "Festa", "Nostalgia"]),
            cover_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80",
            popularity=92, is_favorite=True, play_count=95
        ),
        # Track 8
        DBTrack(
            id="tr_8", video_id="v_8", title="Lofi Beats for Studying", artist="Lofi Girl",
            album="Chillhop Essentials", duration_seconds=180, year=2021, genre="Lo-fi",
            subgenre="Ambient Hip Hop", mood="Relaxar", energy="Baixa", tempo_bpm=80,
            voice_type="Lo-fi", decade="2020s", language="Instrumental",
            themes_json=json.dumps(["Estudar", "Trabalho", "Dormir"]),
            cover_url="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80",
            popularity=85, is_favorite=False, play_count=310
        ),
        # Track 9
        DBTrack(
            id="tr_9", video_id="v_9", title="Midnight City", artist="M83",
            album="Hurry Up, We're Dreaming", duration_seconds=243, year=2011, genre="Eletrônica",
            subgenre="Indie Dance", mood="Motivado", energy="Alta", tempo_bpm=105,
            voice_type="Banda", decade="2010s", language="Inglês",
            themes_json=json.dumps(["Madrugada", "Viagem", "Academia"]),
            cover_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80",
            popularity=91, is_favorite=True, play_count=134
        ),
        # Track 10
        DBTrack(
            id="tr_10", video_id="v_10", title="Levitating", artist="Dua Lipa",
            album="Future Nostalgia", duration_seconds=203, year=2020, genre="Pop",
            subgenre="Nu-Disco", mood="Feliz", energy="Alta", tempo_bpm=103,
            voice_type="Feminina", decade="2020s", language="Inglês",
            themes_json=json.dumps(["Festa", "Academia"]),
            cover_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
            popularity=96, is_favorite=True, play_count=175
        ),
        # Track 11
        DBTrack(
            id="tr_11", video_id="v_11", title="Respirar", artist="Silva",
            album="Brasileiro", duration_seconds=210, year=2018, genre="MPB",
            subgenre="Nova MPB", mood="Relaxar", energy="Baixa", tempo_bpm=95,
            voice_type="Masculina", decade="2010s", language="Português",
            themes_json=json.dumps(["Relaxar", "Estudar", "Dormir"]),
            cover_url="https://images.unsplash.com/photo-1445985543468-b421a465443d?w=300&q=80",
            popularity=80, is_favorite=False, play_count=64
        ),
        # Track 12
        DBTrack(
            id="tr_12", video_id="v_12", title="Clair de Lune", artist="Claude Debussy",
            album="Suite Bergamasque", duration_seconds=305, year=1905, genre="Clássica",
            subgenre="Impressionista", mood="Relaxar", energy="Baixa", tempo_bpm=60,
            voice_type="Instrumental", decade="1900s", language="Instrumental",
            themes_json=json.dumps(["Relaxar", "Estudar", "Dormir"]),
            cover_url="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&q=80",
            popularity=87, is_favorite=True, play_count=210
        )
    ]
    db.add_all(sample_tracks)
    db.commit()

    # Create Initial Playlists
    p1 = DBPlaylist(
        id="pl_1", title="Playlist 1", original_title="Playlist 1",
        description="Músicas misturadas da minha conta", category="Desorganizadas",
        is_organized=False, song_count=5,
        cover_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80"
    )
    p2 = DBPlaylist(
        id="pl_2", title="Legal", original_title="Legal",
        description="Minhas favoritas para o dia a dia", category="Desorganizadas",
        is_organized=False, song_count=4,
        cover_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80"
    )
    p3 = DBPlaylist(
        id="pl_3", title="🎧 Academia & Treino", original_title="Academia",
        description="Músicas com ritmo intenso para treinar pesado.", category="Academia",
        is_organized=True, song_count=4,
        cover_url="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80"
    )

    db.add_all([p1, p2, p3])
    db.commit()

    # Attach tracks to playlists
    p1.tracks.extend([sample_tracks[0], sample_tracks[1], sample_tracks[3], sample_tracks[4], sample_tracks[7]])
    p2.tracks.extend([sample_tracks[2], sample_tracks[5], sample_tracks[6], sample_tracks[10]])
    p3.tracks.extend([sample_tracks[0], sample_tracks[1], sample_tracks[8], sample_tracks[9]])
    db.commit()

    # Initial Audit Log
    init_log = DBAuditLog(
        id=f"log_{uuid.uuid4().hex[:8]}",
        action_type="INITIALIZE_LIBRARY",
        target_type="SYSTEM",
        target_id="system",
        description="Biblioteca importada e sincronizada com sucesso do YouTube Music",
        is_reverted=False
    )
    db.add(init_log)
    db.commit()
    print("Initial seed data complete!")
