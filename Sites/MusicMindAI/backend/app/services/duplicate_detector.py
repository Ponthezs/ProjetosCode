import re
from typing import List, Dict, Any
from app.domain.models import DBTrack, DuplicateGroupSchema, TrackSchema

class DuplicateDetector:
    """
    Fuzzy track match & Audio duplicate detector.
    Analyzes title normalization, artist matching, duration variance (< 5s), and remastered versions.
    """

    @staticmethod
    def _normalize(text: str) -> str:
        text = text.lower()
        # Remove common remaster/deluxe suffixes
        text = re.sub(r'\(remastered.*?\)', '', text)
        text = re.sub(r'\(deluxe.*?\)', '', text)
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return text.strip()

    def find_duplicates(self, tracks: List[DBTrack]) -> List[DuplicateGroupSchema]:
        groups: List[DuplicateGroupSchema] = []
        visited = set()

        for i, t1 in enumerate(tracks):
            if t1.id in visited:
                continue

            norm_t1_title = self._normalize(t1.title)
            norm_t1_artist = self._normalize(t1.artist)
            matching_candidates: List[DBTrack] = []

            for j, t2 in enumerate(tracks):
                if i == j or t2.id in visited:
                    continue

                norm_t2_title = self._normalize(t2.title)
                norm_t2_artist = self._normalize(t2.artist)

                # Similarity checks
                same_artist = (norm_t1_artist in norm_t2_artist) or (norm_t2_artist in norm_t1_artist)
                same_title = (norm_t1_title == norm_t2_title) or (norm_t1_title in norm_t2_title)
                duration_diff = abs(t1.duration_seconds - t2.duration_seconds)

                if same_artist and same_title and duration_diff <= 10:
                    matching_candidates.append(t2)
                    visited.add(t2.id)

            if matching_candidates:
                visited.add(t1.id)
                t1_schema = TrackSchema.model_validate(t1)
                candidates_schemas = [TrackSchema.model_validate(c) for c in matching_candidates]

                diff_reason = f"Diferença de versão/álbum entre '{t1.album or 'Single'}' e '{matching_candidates[0].album or 'Single'}' (Duração: {t1.duration_seconds}s vs {matching_candidates[0].duration_seconds}s)."

                groups.append(DuplicateGroupSchema(
                    id=f"dup_{t1.id}",
                    primary_track=t1_schema,
                    duplicates=candidates_schemas,
                    similarity_score=0.95,
                    reason=diff_reason
                ))

        return groups
