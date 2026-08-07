from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.domain.models import DBUserSettings, UserSettingsSchema

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/", response_model=UserSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(DBUserSettings).first()
    if not settings:
        settings = DBUserSettings(id="default")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return UserSettingsSchema.model_validate(settings)

@router.put("/", response_model=UserSettingsSchema)
def update_settings(req: UserSettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(DBUserSettings).first()
    if not settings:
        settings = DBUserSettings(id="default")
        db.add(settings)

    settings.theme = req.theme
    settings.language = req.language
    settings.ai_model = req.ai_model
    settings.temperature = req.temperature
    settings.suggestion_limit = req.suggestion_limit
    settings.auto_sync = req.auto_sync
    settings.sync_time = req.sync_time
    settings.google_connected = req.google_connected
    settings.google_user_email = req.google_user_email

    db.commit()
    db.refresh(settings)
    return UserSettingsSchema.model_validate(settings)
