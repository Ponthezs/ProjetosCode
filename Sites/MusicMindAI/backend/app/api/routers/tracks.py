from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.domain.models import DBTrack, TrackSchema
from app.infrastructure.ai_service import AIService

router = APIRouter(prefix="/tracks", tags=["Tracks"])
ai_service = AIService()

@router.get("/", response_model=List[TrackSchema])
def list_tracks(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DBTrack)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter((DBTrack.title.ilike(s)) | (DBTrack.artist.ilike(s)))
    if genre:
        query = query.filter(DBTrack.genre == genre)
    if mood:
        query = query.filter(DBTrack.mood == mood)

    tracks = query.all()
    return [TrackSchema.model_validate(t) for t in tracks]

@router.post("/{track_id}/analyze")
def analyze_track(track_id: str, db: Session = Depends(get_db)):
    track = db.query(DBTrack).filter(DBTrack.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Música não encontrada")

    analysis = ai_service.analyze_track(track.title, track.artist, track.album)
    track.genre = analysis.get("genre", track.genre)
    track.subgenre = analysis.get("subgenre", track.subgenre)
    track.mood = analysis.get("mood", track.mood)
    track.energy = analysis.get("energy", track.energy)
    track.tempo_bpm = analysis.get("tempo_bpm", track.tempo_bpm)
    track.voice_type = analysis.get("voice_type", track.voice_type)
    track.decade = analysis.get("decade", track.decade)
    track.language = analysis.get("language", track.language)
    track.themes = analysis.get("themes", track.themes)

    db.commit()
    db.refresh(track)
    return TrackSchema.model_validate(track)

@router.post("/{track_id}/favorite")
def toggle_favorite(track_id: str, db: Session = Depends(get_db)):
    track = db.query(DBTrack).filter(DBTrack.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Música não encontrada")

    track.is_favorite = not track.is_favorite
    db.commit()
    return {"success": True, "track_id": track.id, "is_favorite": track.is_favorite}
