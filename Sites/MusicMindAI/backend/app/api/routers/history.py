from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.domain.models import DBAuditLog, AuditLogSchema
from app.services.backup_audit_service import BackupAuditService

router = APIRouter(prefix="/history", tags=["Audit History"])

@router.get("/", response_model=List[AuditLogSchema])
def get_audit_history(db: Session = Depends(get_db)):
    logs = db.query(DBAuditLog).order_by(DBAuditLog.timestamp.desc()).all()
    return [AuditLogSchema.model_validate(l) for l in logs]

@router.post("/undo/{log_id}")
def undo_action(log_id: str, db: Session = Depends(get_db)):
    service = BackupAuditService(db)
    result = service.undo_action(log_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result
