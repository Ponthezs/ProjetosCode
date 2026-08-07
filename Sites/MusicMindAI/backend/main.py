import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import init_db
from app.api.routers import (
    auth, dashboard, playlists, tracks, ai, duplicates, backup, history, settings, modes
)

app = FastAPI(
    title="MusicMind AI API",
    description="Clean Architecture API para Organização Automática e Inteligente do YouTube Music",
    version="1.0.0"
)

# CORS configuration for local desktop/web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(playlists.router)
app.include_router(tracks.router)
app.include_router(ai.router)
app.include_router(duplicates.router)
app.include_router(backup.router)
app.include_router(history.router)
app.include_router(settings.router)
app.include_router(modes.router)

@app.on_event("startup")
def startup_event():
    init_db()
    print("MusicMind AI Backend Engine started successfully!")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "MusicMind AI Engine",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
