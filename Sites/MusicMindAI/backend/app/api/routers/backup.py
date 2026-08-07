import io
import json
import pandas as pd
from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.domain.models import DBTrack
from app.services.backup_audit_service import BackupAuditService

router = APIRouter(prefix="/backup", tags=["Backup & Restore"])

@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    service = BackupAuditService(db)
    backup_data = service.generate_full_backup_json()
    json_str = json.dumps(backup_data, indent=2, ensure_ascii=False)
    
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=musicmind_backup.json"}
    )

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    tracks = db.query(DBTrack).all()
    records = []
    for t in tracks:
        records.append({
            "ID": t.id,
            "Título": t.title,
            "Artista": t.artist,
            "Álbum": t.album or "",
            "Gênero": t.genre,
            "Mood": t.mood,
            "Energia": t.energy,
            "BPM": t.tempo_bpm,
            "Década": t.decade,
            "Idioma": t.language,
            "Duração(s)": t.duration_seconds
        })

    df = pd.DataFrame(records)
    stream = io.StringIO()
    df.to_csv(stream, index=False, encoding='utf-8-sig')

    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=musicmind_tracks.csv"}
    )
