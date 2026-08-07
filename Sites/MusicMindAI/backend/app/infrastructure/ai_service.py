import os
import json
import random
from typing import Dict, Any, List, Optional
from app.domain.models import TrackSchema, RenameSuggestionSchema

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

class AIService:
    """
    Music Curation & Classification AI Core.
    Uses OpenAI GPT models (gpt-4o / gpt-4o-mini) with robust heuristic fallback.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if (self.api_key and OpenAI) else None

    def analyze_track(self, title: str, artist: str, album: Optional[str] = None) -> Dict[str, Any]:
        """
        Deep multi-dimensional analysis of a song.
        Identifies: Genre, Subgenre, Mood, Energy, Tempo (BPM), Decade, Voice Type, Language, Themes.
        """
        if self.client:
            try:
                prompt = f"""
                Você é um Curador Musical Sênior e Especialista em IA.
                Análise a música:
                Título: "{title}"
                Artista: "{artist}"
                Álbum: "{album or 'Desconhecido'}"

                Retorne estritamente um JSON no seguinte formato:
                {{
                    "genre": "Nome do gênero principal (ex: Synthpop, Rock, MPB, Sertanejo, Eletrônica)",
                    "subgenre": "Subgênero específico",
                    "mood": "Humor (Energético, Motivado, Nostálgico, Romântica, Relaxar, Épico, Feliz, Triste)",
                    "energy": "Baixa | Média | Alta",
                    "tempo_bpm": 120,
                    "voice_type": "Masculina | Feminina | Banda | Instrumental | Acústica | Remix | Ao vivo | Lo-fi | Cover",
                    "decade": "Década no formato (1970s, 1980s, 1990s, 2000s, 2010s, 2020s)",
                    "language": "Português | Inglês | Espanhol | Instrumental | Outro",
                    "themes": ["Viagem", "Academia", "Relaxar", "Estudar", "Dormir", "Festa", "Romântica", "Motivação", "Anime", "Game", "Nostalgia"]
                }}
                """
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                print(f"[AIService] OpenAI analysis fallback due to error: {e}")

        # Smart heuristic fallback rule engine
        return self._heuristic_analyze_track(title, artist, album)

    def _heuristic_analyze_track(self, title: str, artist: str, album: Optional[str] = None) -> Dict[str, Any]:
        t_lower = title.lower()
        a_lower = artist.lower()

        # Genre & Voice detection
        if any(w in a_lower or w in t_lower for w in ["lofi", "chillhop", "beats", "study"]):
            return {
                "genre": "Lo-fi", "subgenre": "Ambient Chill", "mood": "Relaxar",
                "energy": "Baixa", "tempo_bpm": 80, "voice_type": "Lo-fi",
                "decade": "2020s", "language": "Instrumental",
                "themes": ["Estudar", "Relaxar", "Trabalho", "Dormir"]
            }
        elif any(w in a_lower or w in t_lower for w in ["queen", "rock", "metal", "ac/dc", "guitar"]):
            return {
                "genre": "Rock", "subgenre": "Classic Rock", "mood": "Épico",
                "energy": "Alta", "tempo_bpm": 140, "voice_type": "Banda",
                "decade": "1980s", "language": "Inglês",
                "themes": ["Viagem", "Motivação", "Academia"]
            }
        elif any(w in a_lower or w in t_lower for w in ["weeknd", "dua lipa", "m83", "pop"]):
            return {
                "genre": "Pop / Eletrônica", "subgenre": "Synthpop", "mood": "Energético",
                "energy": "Alta", "tempo_bpm": 125, "voice_type": "Masculina" if "weeknd" in a_lower else "Feminina",
                "decade": "2020s", "language": "Inglês",
                "themes": ["Academia", "Festa", "Viagem"]
            }
        elif any(w in a_lower or w in t_lower for w in ["chitãozinho", "sertanejo", "marília", "jorge"]):
            return {
                "genre": "Sertanejo", "subgenre": "Sertanejo Clássico", "mood": "Romântica",
                "energy": "Média", "tempo_bpm": 115, "voice_type": "Masculina",
                "decade": "1990s", "language": "Português",
                "themes": ["Festa", "Romântica", "Nostalgia"]
            }
        elif any(w in a_lower or w in t_lower for w in ["debussy", "chopin", "piano", "symphony"]):
            return {
                "genre": "Clássica", "subgenre": "Impressionismo", "mood": "Relaxar",
                "energy": "Baixa", "tempo_bpm": 65, "voice_type": "Instrumental",
                "decade": "1900s", "language": "Instrumental",
                "themes": ["Relaxar", "Estudar", "Dormir"]
            }
        else:
            return {
                "genre": "Pop / MPB", "subgenre": "Contemporary", "mood": "Feliz",
                "energy": "Média", "tempo_bpm": 110, "voice_type": "Banda",
                "decade": "2020s", "language": "Português",
                "themes": ["Viagem", "Relaxar", "Festa"]
            }

    def suggest_playlist_renaming(self, current_name: str, tracks: List[TrackSchema]) -> RenameSuggestionSchema:
        """
        Detects generic/bad names (Playlist 1, Nova Playlist, Legal, teste, Músicas)
        and suggests punchy, high-conversion playlist titles with descriptions.
        """
        bad_names = ["playlist 1", "playlist", "nova playlist", "legal", "teste", "músicas", "musicas", "sem nome", "minhas"]

        # Calculate primary theme / genre
        genres = [t.genre for t in tracks]
        themes = [th for t in tracks for th in t.themes]
        primary_genre = max(set(genres), key=genres.count) if genres else "Músicas"
        primary_theme = max(set(themes), key=themes.count) if themes else "Vibes"

        needs_rename = current_name.lower().strip() in bad_names or len(current_name) < 4

        if not needs_rename:
            return RenameSuggestionSchema(
                playlist_id="",
                current_name=current_name,
                suggested_name=current_name,
                reason="Nome já é específico e expressivo.",
                suggested_description=f"Seleção especial com foco em {primary_genre} e {primary_theme}."
            )

        # Generate intelligent suggestion
        name_options = {
            "Academia": ["⚡ High Energy Workout", "🔥 Treino Pesado - Focus Mode", "💪 Beast Mode Anthem"],
            "Viagem": ["🚗 Road Trip Vibes", "🌌 Viagem Noturna", "✈️ Horizon Beats"],
            "Relaxar": ["🌙 Chill & Relax", "☕ Soft Ambient Flow", "🌿 Pausa para Respirar"],
            "Festa": ["🎉 Party Starters", "🔥 Hit List Sunset", "🪩 Dance Floor Heat"],
            "Estudar": ["💻 Deep Focus Code", "📚 Study & Concentration", "🧠 Brainwave Alpha"]
        }

        suggested = random.choice(name_options.get(primary_theme, [f"🎧 Pure {primary_genre}", f"✨ {primary_theme} Essentials", f"🔥 Best of {primary_genre}"]))
        desc = f"A melhor seleção de {primary_genre.lower()} e {primary_theme.lower()} curada automaticamente por IA."

        return RenameSuggestionSchema(
            playlist_id="",
            current_name=current_name,
            suggested_name=suggested,
            reason=f"O nome original '{current_name}' é muito genérico. O novo nome reflete o gênero ({primary_genre}) e energia ({primary_theme}).",
            suggested_description=desc
        )

    def generate_playlist_description(self, playlist_title: str, genre: str, mood: str, track_count: int) -> str:
        descriptions = [
            f"Curadoria com {track_count} faixas selecionadas a dedo de {genre} com vibe {mood.lower()}.",
            f"Sua trilha sonora ideal para momentos de {mood.lower()} e imersão total em {genre}.",
            f"As melhores vibrações de {genre} organizadas automaticamente pela IA MusicMind."
        ]
        return random.choice(descriptions)
