from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.domain.models import DBTrack, DBPlaylist
from app.services.duplicate_detector import DuplicateDetector

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    tracks = db.query(DBTrack).all()
    playlists = db.query(DBPlaylist).all()

    total_playlists = len(playlists)
    total_tracks = len(tracks)
    total_artists = len(set(t.artist for t in tracks))
    total_albums = len(set(t.album for t in tracks if t.album))
    
    total_duration_sec = sum(t.duration_seconds for t in tracks)
    hours = total_duration_sec // 3600
    minutes = (total_duration_sec % 3600) // 60
    total_time_str = f"{hours}h {minutes}m"

    # Tops
    artists_counter = Counter(t.artist for t in tracks).most_common(5)
    genres_counter = Counter(t.genre for t in tracks).most_common(5)
    decades_counter = Counter(t.decade for t in tracks).most_common(5)
    languages_counter = Counter(t.language for t in tracks).most_common(5)

    # Duplicates & Disorganized counts
    detector = DuplicateDetector()
    duplicates_groups = detector.find_duplicates(tracks)
    disorganized_playlists_count = sum(1 for p in playlists if not p.is_organized or p.title.lower() in ["playlist 1", "legal", "nova playlist", "teste"])

    # Recent tracks
    recent_tracks = [
        {
            "id": t.id, "title": t.title, "artist": t.artist,
            "album": t.album, "cover_url": t.cover_url, "genre": t.genre
        } for t in sorted(tracks, key=lambda x: x.created_at, reverse=True)[:5]
    ]

    # Chart data
    genre_chart = [{"name": g, "value": count} for g, count in Counter(t.genre for t in tracks).items()]
    artist_chart = [{"name": a, "tracks": count} for a, count in Counter(t.artist for t in tracks).most_common(6)]
    decade_chart = [{"decade": d, "count": count} for d, count in sorted(Counter(t.decade for t in tracks).items())]
    evolution_chart = [
        {"month": "Jan", "organizadas": 2, "desorganizadas": 10},
        {"month": "Fev", "organizadas": 5, "desorganizadas": 7},
        {"month": "Mar", "organizadas": 9, "desorganizadas": 4},
        {"month": "Abr", "organizadas": 12, "desorganizadas": 2},
    ]

    return {
        "metrics": {
            "total_playlists": total_playlists,
            "total_tracks": total_tracks,
            "total_artists": total_artists,
            "total_albums": total_albums,
            "total_time": total_time_str,
            "duplicates_count": len(duplicates_groups),
            "disorganized_playlists_count": disorganized_playlists_count
        },
        "tops": {
            "artists": [{"artist": a, "count": c} for a, c in artists_counter],
            "genres": [{"genre": g, "count": c} for g, c in genres_counter],
            "decades": [{"decade": d, "count": c} for d, c in decades_counter],
            "languages": [{"language": l, "count": c} for l, c in languages_counter]
        },
        "recent_tracks": recent_tracks,
        "charts": {
            "by_genre": genre_chart,
            "by_artist": artist_chart,
            "by_decade": decade_chart,
            "evolution": evolution_chart
        }
    }
