from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.infrastructure.database import get_db
from app.domain.models import DBTrack, DuplicateGroupSchema
from app.services.duplicate_detector import DuplicateDetector
from app.services.backup_audit_service import BackupAuditService

router = APIRouter(prefix="/duplicates", tags=["Duplicates"])

class ResolveDuplicateRequest(BaseModel):
    group_id: str
    keep_track_id: str
    remove_track_ids: List[str]

@router.get("/", response_model=List[DuplicateGroupSchema])
def get_duplicates(db: Session = Depends(get_db)):
    tracks = db.query(DBTrack).all()
    detector = DuplicateDetector()
    return detector.find_duplicates(tracks)

@router.post("/resolve")
def resolve_duplicates(req: ResolveDuplicateRequest, db: Session = Depends(get_db)):
    keep_track = db.query(DBTrack).filter(DBTrack.id == req.keep_track_id).first()
    if not keep_track:
        raise HTTPException(status_code=400, detail="Música selecionada para manter não existe.")

    removed_count = 0
    for rem_id in req.remove_track_ids:
        rem_track = db.query(DBTrack).filter(DBTrack.id == rem_id).first()
        if rem_track:
            # Remove association from playlists (without deleting track entity from global library)
            rem_track.playlists.clear()
            db.delete(rem_track)
            removed_count += 1

    db.commit()

    audit = BackupAuditService(db)
    audit.log_action(
        action_type="DELETE_DUPLICATE",
        target_type="TRACK",
        target_id=req.keep_track_id,
        description=f"Duplicadas resolvidas. Mantida versão '{keep_track.title}' e removidas {removed_count} cópias."
    )

    return {
        "success": True,
        "message": f"Música '{keep_track.title}' mantida com sucesso. {removed_count} duplicadas removidas.",
        "kept_track_id": keep_track.id,
        "removed_count": removed_count
    }
