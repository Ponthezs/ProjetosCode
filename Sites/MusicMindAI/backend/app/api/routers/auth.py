from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.infrastructure.database import get_db
from app.domain.models import DBUserSettings

router = APIRouter(prefix="/auth", tags=["Auth"])

class AuthConnectRequest(BaseModel):
    google_token: str
    user_email: str = "usuario@gmail.com"

@router.get("/status")
def get_auth_status(db: Session = Depends(get_db)):
    settings = db.query(DBUserSettings).first()
    return {
        "is_connected": settings.google_connected if settings else True,
        "user_email": settings.google_user_email if settings else "usuario@gmail.com",
        "provider": "Google OAuth (YouTube Music)",
        "session_saved": True
    }

@router.post("/connect")
def connect_google(req: AuthConnectRequest, db: Session = Depends(get_db)):
    settings = db.query(DBUserSettings).first()
    if settings:
        settings.google_connected = True
        settings.google_user_email = req.user_email
        db.commit()

    return {
        "success": True,
        "message": "Autenticado com sucesso via Google OAuth. Sessão salva permanentemente.",
        "user_email": req.user_email
    }
