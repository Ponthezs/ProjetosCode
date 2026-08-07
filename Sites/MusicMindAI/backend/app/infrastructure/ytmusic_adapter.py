import os
import json
from typing import List, Dict, Any, Optional
from ytmusicapi import YTMusic

class YTMusicAdapter:
    """
    Adapter pattern interface for YouTube Music API (ytmusicapi).
    Supports live OAuth/Headers authentication and local fallback mode.
    """
    def __init__(self, auth_header_file: Optional[str] = "oauth.json"):
        self.auth_file = auth_header_file
        self.ytmusic: Optional[YTMusic] = None
        self.is_connected = False
        self._initialize()

    def _initialize(self):
        if self.auth_file and os.path.exists(self.auth_file):
            try:
                self.ytmusic = YTMusic(self.auth_file)
                self.is_connected = True
                print("[YTMusicAdapter] Connected to live YouTube Music session.")
            except Exception as e:
                print(f"[YTMusicAdapter] Auth initialization warning: {e}. Running in local simulation mode.")
                self.is_connected = False
        else:
            print("[YTMusicAdapter] No OAuth file found. Running in local simulation mode.")
            self.is_connected = False

    def connect_with_raw_headers(self, headers_raw: str) -> bool:
        """Sets up auth using raw cookie/headers string from YouTube Music web session"""
        try:
            auth_json = YTMusic.setup(filepath="oauth.json", headers_raw=headers_raw)
            self.ytmusic = YTMusic("oauth.json")
            self.is_connected = True
            return True
        except Exception as e:
            print(f"[YTMusicAdapter] Setup failed: {e}")
            return False

    def get_library_playlists(self, limit: int = 25) -> List[Dict[str, Any]]:
        if self.is_connected and self.ytmusic:
            try:
                return self.ytmusic.get_library_playlists(limit=limit)
            except Exception as e:
                print(f"Error fetching live playlists: {e}")
        return []

    def get_playlist_tracks(self, playlist_id: str) -> List[Dict[str, Any]]:
        if self.is_connected and self.ytmusic:
            try:
                res = self.ytmusic.get_playlist(playlist_id=playlist_id)
                return res.get("tracks", [])
            except Exception as e:
                print(f"Error fetching playlist tracks: {e}")
        return []

    def create_playlist(self, title: str, description: str, video_ids: List[str] = None) -> Optional[str]:
        if self.is_connected and self.ytmusic:
            try:
                pl_id = self.ytmusic.create_playlist(title=title, description=description, video_ids=video_ids or [])
                return pl_id
            except Exception as e:
                print(f"Error creating live playlist: {e}")
        return None

    def add_playlist_items(self, playlist_id: str, video_ids: List[str]) -> bool:
        if self.is_connected and self.ytmusic:
            try:
                self.ytmusic.add_playlist_items(playlist_id=playlist_id, video_ids=video_ids)
                return True
            except Exception as e:
                print(f"Error adding tracks to live playlist: {e}")
        return True

    def remove_playlist_items(self, playlist_id: str, video_ids: List[str]) -> bool:
        if self.is_connected and self.ytmusic:
            try:
                # ytmusicapi requires playlist track objects with setVideoId/videoId
                tracks = self.get_playlist_tracks(playlist_id)
                to_remove = [t for t in tracks if t.get("videoId") in video_ids]
                if to_remove:
                    self.ytmusic.remove_playlist_items(playlist_id=playlist_id, videos=to_remove)
                return True
            except Exception as e:
                print(f"Error removing tracks from live playlist: {e}")
        return True
