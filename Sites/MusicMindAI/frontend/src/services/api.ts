import { Track, Playlist, PreviewMoveOperation, RenameSuggestion, DuplicateGroup, AuditLog, UserSettings, Recommendation, ListeningMode } from '../types';

const API_BASE = 'http://localhost:8000';

export async function fetchAuthStatus() {
  const res = await fetch(`${API_BASE}/auth/status`);
  return res.json();
}

export async function connectGoogle(user_email: string) {
  const res = await fetch(`${API_BASE}/auth/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ google_token: 'oauth_token_saved', user_email })
  });
  return res.json();
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  return res.json();
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/playlists/`);
  return res.json();
}

export async function renamePlaylist(id: string, new_title: string, new_description?: string) {
  const res = await fetch(`${API_BASE}/playlists/${id}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_title, new_description })
  });
  return res.json();
}

export async function generateCover(id: string, style: string = 'neon') {
  const res = await fetch(`${API_BASE}/playlists/${id}/generate-cover?style=${style}`, {
    method: 'POST'
  });
  return res.json();
}

export async function suggestRename(id: string): Promise<RenameSuggestion> {
  const res = await fetch(`${API_BASE}/playlists/suggest-rename/${id}`);
  return res.json();
}

export async function fetchTracks(search?: string, genre?: string, mood?: string): Promise<Track[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (genre) params.append('genre', genre);
  if (mood) params.append('mood', mood);
  const res = await fetch(`${API_BASE}/tracks/?${params.toString()}`);
  return res.json();
}

export async function fetchAIReorganizePreview(): Promise<PreviewMoveOperation[]> {
  const res = await fetch(`${API_BASE}/ai/reorganize/preview`);
  return res.json();
}

export async function confirmAIReorganization() {
  const res = await fetch(`${API_BASE}/ai/reorganize/confirm`, { method: 'POST' });
  return res.json();
}

export async function fetchDuplicates(): Promise<DuplicateGroup[]> {
  const res = await fetch(`${API_BASE}/duplicates/`);
  return res.json();
}

export async function resolveDuplicates(group_id: string, keep_track_id: string, remove_track_ids: string[]) {
  const res = await fetch(`${API_BASE}/duplicates/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_id, keep_track_id, remove_track_ids })
  });
  return res.json();
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/ai/recommendations`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/history/`);
  return res.json();
}

export async function undoAuditAction(log_id: string) {
  const res = await fetch(`${API_BASE}/history/undo/${log_id}`, { method: 'POST' });
  return res.json();
}

export async function fetchSettings(): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/settings/`);
  return res.json();
}

export async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/settings/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export async function fetchListeningModes(): Promise<ListeningMode[]> {
  const res = await fetch(`${API_BASE}/modes/`);
  return res.json();
}

export async function launchListeningMode(key: string) {
  const res = await fetch(`${API_BASE}/modes/launch/${key}`, { method: 'POST' });
  return res.json();
}
