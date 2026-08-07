export interface Track {
  id: string;
  video_id?: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds: number;
  year?: number;
  genre: string;
  subgenre?: string;
  mood: string;
  energy: string;
  tempo_bpm: number;
  voice_type: string;
  decade: string;
  language: string;
  themes: string[];
  cover_url?: string;
  popularity: number;
  is_favorite: boolean;
  play_count: number;
}

export interface Playlist {
  id: string;
  title: string;
  original_title?: string;
  description?: string;
  cover_url?: string;
  category: string;
  is_organized: boolean;
  song_count: number;
  tracks: Track[];
}

export interface PreviewMoveOperation {
  playlist_id: string;
  playlist_title: string;
  added_tracks: Track[];
  removed_tracks: Track[];
  summary: string;
}

export interface RenameSuggestion {
  playlist_id: string;
  current_name: string;
  suggested_name: string;
  reason: string;
  suggested_description: string;
}

export interface DuplicateGroup {
  id: string;
  primary_track: Track;
  duplicates: Track[];
  similarity_score: number;
  reason: string;
}

export interface AuditLog {
  id: string;
  action_type: string;
  timestamp: string;
  target_type: string;
  target_id: string;
  description: string;
  is_reverted: boolean;
}

export interface UserSettings {
  theme: string;
  language: string;
  ai_model: string;
  temperature: number;
  suggestion_limit: number;
  auto_sync: boolean;
  sync_time: string;
  google_connected: boolean;
  google_user_email: string;
}

export interface Recommendation {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  match_score: number;
  reason: string;
  cover_url?: string;
}

export interface ListeningMode {
  key: string;
  title: string;
  icon: string;
  description: string;
}
