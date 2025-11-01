"""
Build a 480-movie dataset (4 genres × 120) from TMDb with constraints:
- Genres: Action, Comedy, Drama, Thriller
- Each movie must exist on TMDb (obviously) and have an available trailer/teaser video
- Exclude adult/erotic content
- Exclude "famous" movies (configurable via popularity & vote_count thresholds)
- Export to Excel, CSV and JSON with useful columns for your thesis
"""

import os
import time
import random
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if not TMDB_API_KEY:
    raise RuntimeError("Please set TMDB_API_KEY in a .env file or environment variable.")

API_BASE = "https://api.themoviedb.org/3"
SESSION = requests.Session()
SESSION.params = {"api_key": TMDB_API_KEY}

GENRES = {
    "Action": 28,
    "Comedy": 35,
    "Drama": 18,
    "Thriller": 53
}

TARGET_PER_GENRE = 120
MAX_POPULARITY = 40.0
MIN_VOTE_COUNT = 25
MAX_VOTE_COUNT = 6000
YEAR_MIN = 1990
YEAR_MAX = 2024
EXCLUDE_KEYWORDS = {"erotic", "porn", "hentai", "xxx", "adult film", "sexploitation"}

def sleep():
    time.sleep(0.3)

def get_json(path, params=None):
    sleep()
    r = SESSION.get(f"{API_BASE}{path}", params=params or {}, timeout=30)
    r.raise_for_status()
    return r.json()

def has_erotic_content(title, overview):
    text = (title + " " + overview).lower()
    return any(k in text for k in EXCLUDE_KEYWORDS)

def get_videos(mid):
    return get_json(f"/movie/{mid}/videos", {"language": "en-US"}).get("results", [])

def pick_trailer(videos):
    for v in videos:
        if v.get("site") == "YouTube" and "trailer" in (v.get("type") or "").lower():
            return f"https://www.youtube.com/watch?v={v['key']}"
    return None

def discover(genre_id, page):
    params = {
        "with_genres": genre_id,
        "include_adult": "false",
        "language": "en-US",
        "sort_by": "popularity.asc",
        "page": page,
        "primary_release_date.gte": f"{YEAR_MIN}-01-01",
        "primary_release_date.lte": f"{YEAR_MAX}-12-31",
    }
    return get_json("/discover/movie", params).get("results", [])

def build_dataset():
    rows = []
    for gname, gid in GENRES.items():
        print(f"Collecting {gname}...")
        page = 1
        collected = 0
        while collected < TARGET_PER_GENRE and page <= 500:
            for m in discover(gid, page):
                if has_erotic_content(m.get("title",""), m.get("overview","")):
                    continue
                pop = float(m.get("popularity",0))
                vc = int(m.get("vote_count",0))
                if pop > MAX_POPULARITY or vc < MIN_VOTE_COUNT or vc > MAX_VOTE_COUNT:
                    continue
                vids = get_videos(m["id"])
                trailer = pick_trailer(vids)
                if not trailer:
                    continue
                rows.append({
                    "title": m["title"],
                    "year": m.get("release_date","")[:4],
                    "genre": gname,
                    "tmdb_url": f"https://www.themoviedb.org/movie/{m['id']}",
                    "youtube_trailer_url": trailer,
                    "popularity": pop,
                    "vote_count": vc,
                    "language": m.get("original_language","")
                })
                collected += 1
                if collected >= TARGET_PER_GENRE:
                    break
            print(f"  page {page} → {collected} movies")
            page += 1
    return pd.DataFrame(rows)

if __name__ == "__main__":
    df = build_dataset()
    df.to_excel("movies_dataset_480.xlsx", index=False)
    df.to_csv("movies_dataset_480.csv", index=False)
    df.to_json("movies_dataset_480.json", orient="records", indent=2)
    print("✅ Saved movies_dataset_480.xlsx, .csv and .json")
