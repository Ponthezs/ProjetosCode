import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.domain.models import DBTrack, DBPlaylist, DBAuditLog, DBUserSettings

class BackupAuditService:
    """
    Manages audit logging, 1-click Undo reversal, and full library JSON/CSV backups.
    """

    def __init__(self, db: Session):
        self.db = db

    def log_action(
        self,
        action_type: str,
        target_type: str,
        target_id: str,
        description: str,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None
    ) -> DBAuditLog:
        log = DBAuditLog(
            id=f"log_{uuid.uuid4().hex[:10]}",
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            description=description,
            before_state_json=json.dumps(before_state or {}),
            after_state_json=json.dumps(after_state or {}),
            is_reverted=False,
            timestamp=datetime.utcnow()
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def undo_action(self, log_id: str) -> Dict[str, Any]:
        """
        Reverts an action using the logged before_state snapshot.
        """
        log = self.db.query(DBAuditLog).filter(DBAuditLog.id == log_id).first()
        if not log:
            return {"success": False, "message": "Registro de auditoria não encontrado."}

        if log.is_reverted:
            return {"success": False, "message": "Esta ação já foi desfeita previamente."}

        before_state = json.loads(log.before_state_json or "{}")

        try:
            if log.action_type == "RENAME_PLAYLIST":
                pl_id = log.target_id
                old_title = before_state.get("title")
                pl = self.db.query(DBPlaylist).filter(DBPlaylist.id == pl_id).first()
                if pl and old_title:
                    pl.title = old_title
                    self.db.commit()

            elif log.action_type == "MOVE_TRACK":
                # Restore tracks to original playlist
                pl_id = log.target_id
                old_track_ids = before_state.get("track_ids", [])
                pl = self.db.query(DBPlaylist).filter(DBPlaylist.id == pl_id).first()
                if pl:
                    tracks = self.db.query(DBTrack).filter(DBTrack.id.in_(old_track_ids)).all()
                    pl.tracks = tracks
                    pl.song_count = len(tracks)
                    self.db.commit()

            log.is_reverted = True
            self.db.commit()
            return {"success": True, "message": f"Ação '{log.description}' desfeita com sucesso!"}

        except Exception as e:
            self.db.rollback()
            return {"success": False, "message": f"Erro ao desfazer ação: {str(e)}"}

    def generate_full_backup_json(self) -> Dict[str, Any]:
        tracks = self.db.query(DBTrack).all()
        playlists = self.db.query(DBPlaylist).all()
        settings = self.db.query(DBUserSettings).first()

        tracks_data = [
            {
                "id": t.id, "title": t.title, "artist": t.artist, "album": t.album,
                "genre": t.genre, "mood": t.mood, "energy": t.energy, "decade": t.decade,
                "duration_seconds": t.duration_seconds, "video_id": t.video_id
            } for t in tracks
        ]

        playlists_data = [
            {
                "id": p.id, "title": p.title, "description": p.description,
                "category": p.category, "track_ids": [t.id for t in p.tracks]
            } for p in playlists
        ]

        return {
            "version": "1.0",
            "exported_at": datetime.utcnow().isoformat(),
            "tracks_count": len(tracks_data),
            "playlists_count": len(playlists_data),
            "tracks": tracks_data,
            "playlists": playlists_data,
            "settings": {
                "theme": settings.theme if settings else "dark",
                "ai_model": settings.ai_model if settings else "gpt-4o-mini"
            }
        }
