import unittest
from fastapi.testclient import TestClient
from main import app
from app.services.duplicate_detector import DuplicateDetector
from app.domain.models import DBTrack

class TestMusicMindBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from app.infrastructure.database import init_db
        init_db()
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["app"], "MusicMind AI Engine")

    def test_dashboard_summary(self):
        res = self.client.get("/dashboard/summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("metrics", data)

    def test_list_playlists(self):
        res = self.client.get("/playlists/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.json()) > 0)

    def test_ai_reorganize_preview(self):
        res = self.client.get("/ai/reorganize/preview")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.json()) > 0)

    def test_list_listening_modes(self):
        res = self.client.get("/modes/")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 12)

if __name__ == "__main__":
    unittest.main()
