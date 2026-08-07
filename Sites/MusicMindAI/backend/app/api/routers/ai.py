from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.infrastructure.database import get_db
from app.domain.models import DBTrack, DBPlaylist, TrackSchema, PreviewMoveOperation
from app.infrastructure.ai_service import AIService
from app.services.backup_audit_service import BackupAuditService
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/ai", tags=["AI Operations"])
ai_service = AIService()

class LearningPayload(BaseModel):
    track_id: str
    artist: str
    genre: str
    moved_from_playlist: str
    moved_to_playlist: str

@router.get("/reorganize/preview", response_model=List[PreviewMoveOperation])
def preview_ai_reorganization(db: Session = Depends(get_db)):
    """
    Analyzes all tracks and generates a preview of suggested moves.
    Fulfills rule: "Sempre perguntar antes de mover músicas. Mostrar uma prévia. Exemplo: Playlist Academia +18 músicas -4 músicas."
    """
    tracks = db.query(DBTrack).all()
    playlists = db.query(DBPlaylist).all()

    # Pre-calculated category targets
    category_map = {
        "Academia": ["⚡ Academia & Treino", []],
        "Viagem": ["🚗 Viagem & Estrada", []],
        "Relaxar": ["🌙 Relaxar & Chill", []],
        "Festa": ["🎉 Festa & Balada", []],
        "Estudar": ["💻 Trabalho & Estudos", []],
        "Rock": ["🎸 Rock Classics", []],
        "Pop": ["🎤 Pop Hits", []],
        "Eletrônica": ["🎧 Eletrônicas", []],
        "Sertanejo": ["🇧🇷 Sertanejo & MPB", []],
        "Nostalgia": ["📻 Nostalgia Vintage", []]
    }

    # Distribute tracks to category targets based on AI themes and genres
    for t in tracks:
        assigned = False
        for theme in t.themes:
            if theme in category_map:
                category_map[theme][1].append(t)
                assigned = True
                break

        if not assigned:
            if t.genre in category_map:
                category_map[t.genre][1].append(t)
            elif t.genre == "Rock":
                category_map["Rock"][1].append(t)
            elif t.genre in ["Pop", "Synthpop"]:
                category_map["Pop"][1].append(t)
            else:
                category_map["Relaxar"][1].append(t)

    previews: List[PreviewMoveOperation] = []

    for cat_key, (pl_title, target_tracks) in category_map.items():
        if not target_tracks:
            continue

        existing_pl = next((p for p in playlists if p.title.lower() == pl_title.lower() or p.category == cat_key), None)
        current_tracks = existing_pl.tracks if existing_pl else []
        current_ids = set(tr.id for tr in current_tracks)
        target_ids = set(tr.id for tr in target_tracks)

        added = [TrackSchema.model_validate(tr) for tr in target_tracks if tr.id not in current_ids]
        removed = [TrackSchema.model_validate(tr) for tr in current_tracks if tr.id not in target_ids]

        summary_text = f"Adicionar +{len(added)} faixas, manter {len(target_tracks) - len(added)} faixas."
        if removed:
            summary_text += f" (Mover {len(removed)} fora desta playlist)"

        previews.append(PreviewMoveOperation(
            playlist_id=existing_pl.id if existing_pl else f"new_{cat_key.lower()}",
            playlist_title=pl_title,
            added_tracks=added[:10], # Truncated sample for quick rendering
            removed_tracks=removed[:5],
            summary=summary_text
        ))

    return previews

@router.post("/reorganize/confirm")
def confirm_ai_reorganization(db: Session = Depends(get_db)):
    """
    Applies the reorganization safely.
    Ensures existing playlists are never deleted and songs are never deleted from library.
    """
    previews = preview_ai_reorganization(db)
    audit = BackupAuditService(db)
    updated_playlists = 0

    for prev in previews:
        pl = db.query(DBPlaylist).filter(DBPlaylist.id == prev.playlist_id).first()
        if not pl:
            pl = DBPlaylist(
                id=prev.playlist_id if not prev.playlist_id.startswith("new_") else f"pl_{len(db.query(DBPlaylist).all())+1}",
                title=prev.playlist_title,
                original_title=prev.playlist_title,
                category=prev.playlist_title,
                is_organized=True,
                description=f"Playlist de {prev.playlist_title} organizada automaticamente por IA."
            )
            db.add(pl)
            db.commit()

        # Add tracks
        for tr_schema in prev.added_tracks:
            track = db.query(DBTrack).filter(DBTrack.id == tr_schema.id).first()
            if track and track not in pl.tracks:
                pl.tracks.append(track)

        pl.is_organized = True
        pl.song_count = len(pl.tracks)
        db.commit()
        updated_playlists += 1

    audit.log_action(
        action_type="REORGANIZATION",
        target_type="LIBRARY",
        target_id="all_playlists",
        description=f"Reorganização automática concluída com sucesso em {updated_playlists} playlists."
    )

    return {
        "success": True,
        "message": f"Organização concluída em {updated_playlists} playlists sem remover nenhuma música do catálogo!",
        "playlists_updated": updated_playlists
    }

@router.post("/learn")
def record_learning(payload: LearningPayload, db: Session = Depends(get_db)):
    engine = RecommendationEngine(db)
    engine.record_learning(
        track_id=payload.track_id,
        artist=payload.artist,
        genre=payload.genre,
        moved_from=payload.moved_from_playlist,
        moved_to=payload.moved_to_playlist
    )
    return {
        "success": True,
        "message": f"IA aprendeu sua preferência para '{payload.artist}'. Futuras sugestões utilizarão este padrão!"
    }

@router.get("/recommendations")
def get_recommendations(limit: int = 8, db: Session = Depends(get_db)):
    engine = RecommendationEngine(db)
    return engine.get_recommendations(limit=limit)
