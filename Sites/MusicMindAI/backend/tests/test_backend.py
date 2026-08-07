import pytest
from fastapi.testclient import TestClient
from main import app
from app.services.duplicate_detector import DuplicateDetector
from app.domain.models import DBTrack

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "MusicMind AI Engine"

def test_dashboard_summary():
    response = client.get("/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "total_playlists" in data["metrics"]
    assert "charts" in data

def test_list_playlists():
    response = client.get("/playlists/")
    assert response.status_code == 200
    playlists = response.json()
    assert isinstance(playlists, list)
    assert len(playlists) > 0

def test_duplicate_detector_unit():
    detector = DuplicateDetector()
    t1 = DBTrack(id="1", title="Bohemian Rhapsody", artist="Queen", duration_seconds=354, album="Album A")
    t2 = DBTrack(id="2", title="Bohemian Rhapsody (Remastered 2011)", artist="Queen", duration_seconds=355, album="Album B")
    
    dups = detector.find_duplicates([t1, t2])
    assert len(dups) == 1
    assert dups[0].primary_track.id == "1"
    assert dups[0].duplicates[0].id == "2"

def test_ai_reorganize_preview():
    response = client.get("/ai/reorganize/preview")
    assert response.status_code == 200
    previews = response.json()
    assert isinstance(previews, list)
    assert len(previews) > 0
    assert "summary" in previews[0]

def test_list_listening_modes():
    response = client.get("/modes/")
    assert response.status_code == 200
    modes = response.json()
    assert len(modes) >= 12
