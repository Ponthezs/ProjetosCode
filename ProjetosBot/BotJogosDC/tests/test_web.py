import pytest
from fastapi.testclient import TestClient
from web.app import web_app
from database.database import init_db

client = TestClient(web_app)

@pytest.mark.asyncio
async def test_web_routes():
    await init_db()

    response = client.get("/")
    assert response.status_code == 200
    assert "Painel Admin" in response.text

    stats_resp = client.get("/api/stats")
    assert stats_resp.status_code == 200
    json_data = stats_resp.json()
    assert "total_monitored_games" in json_data

    sync_resp = client.post("/api/sync")
    assert sync_resp.status_code == 200
    assert sync_resp.json()["status"] == "started"
