from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.domain.models import DBTrack, TrackSchema

router = APIRouter(prefix="/modes", tags=["AI Listening Modes"])

MODES_CONFIG = {
    "dj": {
        "title": "Modo DJ",
        "icon": "Disc3",
        "description": "Transições perfeitas, batidas contínuas e harmonização de BPM para festas ininterruptas.",
        "filter": lambda t: t.tempo_bpm >= 120 or t.genre in ["Eletrônica", "Pop", "Synthpop"]
    },
    "descobertas": {
        "title": "Modo Descobertas",
        "icon": "Compass",
        "description": "Exploração de novos sons, artistas independentes e lados B surpreendentes.",
        "filter": lambda t: t.play_count < 50 or t.is_favorite is False
    },
    "nostalgia": {
        "title": "Modo Nostalgia",
        "icon": "History",
        "description": "Uma viagem aos clássicos atemporais dos anos 70, 80, 90 e 2000.",
        "filter": lambda t: t.decade in ["1970s", "1980s", "1990s", "2000s"]
    },
    "festa": {
        "title": "Modo Festa",
        "icon": "PartyPopper",
        "description": "Músicas com alta energia e ritmo contagiante para agitar o ambiente.",
        "filter": lambda t: t.energy == "Alta" or t.mood in ["Energético", "Feliz"]
    },
    "relaxar": {
        "title": "Modo Relaxar",
        "icon": "Smile",
        "description": "Melodias suaves, timbres calmos e frequências para descompressão total.",
        "filter": lambda t: t.energy == "Baixa" or t.mood == "Relaxar"
    },
    "chuva": {
        "title": "Modo Chuva",
        "icon": "CloudRain",
        "description": "Texturas de piano, acústicos e lofi aconchegantes para dias chuvosos.",
        "filter": lambda t: t.genre in ["Lo-fi", "MPB", "Clássica"] or t.voice_type in ["Instrumental", "Acústica"]
    },
    "roadtrip": {
        "title": "Modo Road Trip",
        "icon": "Car",
        "description": "Trilha sonora para colocar os pés na estrada com janelas abertas e horizonte livre.",
        "filter": lambda t: "Viagem" in t.themes or t.genre == "Rock"
    },
    "gamer": {
        "title": "Modo Gamer",
        "icon": "Gamepad2",
        "description": "Chiptune, sintetizadores pesados e eletrônicas aceleradas para gameplay de alta performance.",
        "filter": lambda t: t.genre in ["Eletrônica", "Synthpop"] and t.energy == "Alta"
    },
    "cafe": {
        "title": "Modo Café",
        "icon": "Coffee",
        "description": "Bossa nova, jazz e indie acústico para transformar a tarde em um ambiente aconchegante.",
        "filter": lambda t: t.genre in ["MPB", "Lo-fi", "Indie Pop"]
    },
    "escritorio": {
        "title": "Modo Escritório",
        "icon": "Briefcase",
        "description": "Ritmo equilibrado sem vocais distrativos para manter o foco constante no trabalho.",
        "filter": lambda t: t.energy == "Média" or t.voice_type == "Instrumental"
    },
    "programacao": {
        "title": "Modo Programação",
        "icon": "Code2",
        "description": "BPM acelerado e consistente, synthwave e lofi para entrar na zona de código produtivo.",
        "filter": lambda t: t.genre in ["Lo-fi", "Synthpop", "Eletrônica"]
    },
    "estudos": {
        "title": "Modo Estudos",
        "icon": "BookOpen",
        "description": "Ondas alfa e composições neoclássicas para maximizar a retenção e aprendizado.",
        "filter": lambda t: t.genre in ["Clássica", "Lo-fi"] or t.voice_type == "Instrumental"
    }
}

@router.get("/")
def list_available_modes():
    modes = []
    for mode_key, config in MODES_CONFIG.items():
        modes.append({
            "key": mode_key,
            "title": config["title"],
            "icon": config["icon"],
            "description": config["description"]
        })
    return modes

@router.post("/launch/{mode_key}")
def launch_mode(mode_key: str, db: Session = Depends(get_db)):
    if mode_key not in MODES_CONFIG:
        raise HTTPException(status_code=404, detail="Modo de reprodução não encontrado.")

    config = MODES_CONFIG[mode_key]
    all_tracks = db.query(DBTrack).all()

    matching_tracks = [t for t in all_tracks if config["filter"](t)]
    if not matching_tracks:
        matching_tracks = all_tracks[:5] # Fallback

    tracks_schema = [TrackSchema.model_validate(t) for t in matching_tracks]

    return {
        "success": True,
        "mode_key": mode_key,
        "title": config["title"],
        "description": config["description"],
        "total_tracks": len(tracks_schema),
        "tracks": tracks_schema
    }
