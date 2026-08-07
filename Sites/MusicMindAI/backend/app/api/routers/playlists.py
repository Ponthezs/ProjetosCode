from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.infrastructure.database import get_db
from app.domain.models import DBPlaylist, DBTrack, PlaylistSchema, TrackSchema
from app.infrastructure.ai_service import AIService
from app.services.cover_generator import CoverGenerator
from app.services.backup_audit_service import BackupAuditService

router = APIRouter(prefix="/playlists", tags=["Playlists"])
ai_service = AIService()
cover_gen = CoverGenerator()

class RenameRequest(BaseModel):
    new_title: str
    new_description: Optional[str] = None

class MergePlaylistsRequest(BaseModel):
    source_playlist_ids: List[str]
    target_title: str

@router.get("/", response_model=List[PlaylistSchema])
def list_playlists(db: Session = Depends(get_db)):
    playlists = db.query(DBPlaylist).all()
    result = []
    for p in playlists:
        tracks_schema = [TrackSchema.model_validate(t) for t in p.tracks]
        result.append(PlaylistSchema(
            id=p.id,
            title=p.title,
            original_title=p.original_title,
            description=p.description,
            cover_url=p.cover_url,
            category=p.category,
            is_organized=p.is_organized,
            song_count=len(p.tracks),
            tracks=tracks_schema
        ))
    return result

@router.get("/{playlist_id}", response_model=PlaylistSchema)
def get_playlist(playlist_id: str, db: Session = Depends(get_db)):
    p = db.query(DBPlaylist).filter(DBPlaylist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist não encontrada")
    
    tracks_schema = [TrackSchema.model_validate(t) for t in p.tracks]
    return PlaylistSchema(
        id=p.id,
        title=p.title,
        original_title=p.original_title,
        description=p.description,
        cover_url=p.cover_url,
        category=p.category,
        is_organized=p.is_organized,
        song_count=len(p.tracks),
        tracks=tracks_schema
    )

@router.post("/{playlist_id}/rename")
def rename_playlist(playlist_id: str, req: RenameRequest, db: Session = Depends(get_db)):
    p = db.query(DBPlaylist).filter(DBPlaylist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist não encontrada")

    audit = BackupAuditService(db)
    before_state = {"title": p.title, "description": p.description}

    p.title = req.new_title
    if req.new_description:
        p.description = req.new_description
    p.is_organized = True
    db.commit()

    after_state = {"title": p.title, "description": p.description}
    audit.log_action(
        action_type="RENAME_PLAYLIST",
        target_type="PLAYLIST",
        target_id=p.id,
        description=f"Playlist renomeada de '{before_state['title']}' para '{p.title}'",
        before_state=before_state,
        after_state=after_state
    )

    return {"success": True, "playlist_id": p.id, "new_title": p.title}

@router.post("/{playlist_id}/generate-cover")
def generate_playlist_cover(playlist_id: str, style: str = "neon", db: Session = Depends(get_db)):
    p = db.query(DBPlaylist).filter(DBPlaylist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist não encontrada")

    cover_b64 = cover_gen.generate_cover_b64(p.title, style=style)
    p.cover_url = cover_b64
    db.commit()

    return {"success": True, "cover_url": cover_b64}

@router.get("/suggest-rename/{playlist_id}")
def suggest_rename(playlist_id: str, db: Session = Depends(get_db)):
    p = db.query(DBPlaylist).filter(DBPlaylist.id == playlist_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Playlist não encontrada")

    tracks_schema = [TrackSchema.model_validate(t) for t in p.tracks]
    suggestion = ai_service.suggest_playlist_renaming(p.title, tracks_schema)
    suggestion.playlist_id = p.id
    return suggestion

@router.post("/merge")
def merge_playlists(req: MergePlaylistsRequest, db: Session = Depends(get_db)):
    source_pls = db.query(DBPlaylist).filter(DBPlaylist.id.in_(req.source_playlist_ids)).all()
    if not source_pls:
        raise HTTPException(status_code=400, detail="Nenhuma playlist de origem válida.")

    # Collect all unique tracks
    merged_tracks = {}
    for pl in source_pls:
        for track in pl.tracks:
            merged_tracks[track.id] = track

    # Create new merged playlist
    new_id = f"pl_merged_{len(db.query(DBPlaylist).all()) + 1}"
    merged_pl = DBPlaylist(
        id=new_id,
        title=req.target_title,
        original_title=req.target_title,
        description=f"Playlist gerada pela fusão de {len(source_pls)} playlists parecidas.",
        category="Fusão",
        is_organized=True,
        song_count=len(merged_tracks),
        cover_url=cover_gen.generate_cover_b64(req.target_title)
    )
    merged_pl.tracks.extend(list(merged_tracks.values()))
    db.add(merged_pl)
    db.commit()

    audit = BackupAuditService(db)
    audit.log_action(
        action_type="MERGE_PLAYLISTS",
        target_type="PLAYLIST",
        target_id=new_id,
        description=f"Fusão de {len(source_pls)} playlists para criar '{req.target_title}'"
    )

    return {"success": True, "merged_playlist_id": new_id, "total_tracks": len(merged_tracks)}
