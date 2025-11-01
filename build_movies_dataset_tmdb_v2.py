"""
Build a 480-movie dataset (4 genres × 120) from TMDb with practical constraints:
- Genres: Action, Comedy, Drama, Thriller
- Each movie must be on TMDb and have a YouTube Trailer or Teaser
- Excludes erotic content (keyword screen)
- Avoids very famous movies using adjustable popularity/vote_count caps
- Robust: popularity.desc, no language lock for videos, adaptive filter relaxation
- Exports Excel, CSV, JSON

Usage:
  1) pip install requests pandas openpyxl python-dotenv
  2) Put TMDB_API_KEY=YOUR_KEY in .env (project root)
  3) python build_movies_dataset_tmdb_v2.py
"""

import os
import time
import math
import random
import requests
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from dotenv import load_dotenv

# ----------------------- Config -----------------------
load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if not TMDB_API_KEY:
    raise RuntimeError("Please set TMDB_API_KEY in .env or environment variables.")

# Targets
GENRES = {"Action": 28, "Comedy": 35, "Drama": 18, "Thriller": 53}
TARGET_PER_GENRE = 120           # set 20 for a quick dry-run, then set back to 120

# Initial fame/quality heuristics (adapted if not enough are found)
MAX_POPULARITY = 150.0           # initial upper bound; will auto-relax as we scan deeper
MIN_VOTE_COUNT = 5
MAX_VOTE_COUNT = 50000

# Year window (broad on purpose)
YEAR_MIN = 1980
YEAR_MAX = 2025

# Safety: exclude erotic content by crude keyword screen
EXCLUDE_KEYWORDS = {
    "erotic", "porn", "porno", "pornographic", "softcore", "hardcore",
    "sexploitation", "xxx", "adult film", "adult movie", "explicit sex", "hentai"
}

# Request pacing and retries
REQUESTS_PER_SEC = 4.0
BASE_SLEEP = 1.0 / REQUESTS_PER_SEC
MAX_PAGES = 500
SEED = 42
random.seed(SEED)

# ------------------------------------------------------

API_BASE = "https://api.themoviedb.org/3"
SESSION = requests.Session()
SESSION.params = {"api_key": TMDB_API_KEY}
SESSION.headers.update({"Accept": "application/json"})

def _sleep(mult: float = 1.0):
    time.sleep(BASE_SLEEP * mult)

def request_json(path: str, params: Dict[str, Any] = None, attempts: int = 3) -> Dict[str, Any]:
    params = params or {}
    for i in range(attempts):
        try:
            _sleep(1.0 + 0.15 * i)  # gentle backoff
            r = SESSION.get(f"{API_BASE}{path}", params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            if i == attempts - 1:
                raise
    return {}

def discover_page(genre_id: int, page: int) -> List[Dict[str, Any]]:
    # popularity.desc to find items that likely have videos; we still cap "fame"
    params = {
        "with_genres": genre_id,
        "include_adult": "false",
        "sort_by": "popularity.desc",
        "page": page,
        "primary_release_date.gte": f"{YEAR_MIN}-01-01",
        "primary_release_date.lte": f"{YEAR_MAX}-12-31",
        # don't filter by vote_count here; we apply our own logic later
    }
    data = request_json("/discover/movie", params)
    return data.get("results", [])

def fetch_videos(movie_id: int) -> List[Dict[str, Any]]:
    # no language param -> accept any language; many entries register trailers non-en
    data = request_json(f"/movie/{movie_id}/videos")
    return data.get("results", [])

def pick_trailer_url(videos: List[Dict[str, Any]]) -> Optional[str]:
    # Prefer Trailer over Teaser; prefer official; YouTube only
    candidates = [v for v in videos if v.get("site") == "YouTube" and v.get("key")]
    if not candidates:
        return None
    def score(v):
        t = (v.get("type") or "").lower()
        typ = 2 if t == "trailer" else (1 if t == "teaser" else 0)
        official = 1 if v.get("official") else 0
        return (typ, official)
    best = sorted(candidates, key=score, reverse=True)[0]
    return f"https://www.youtube.com/watch?v={best['key']}"

def is_erotic(title: str, overview: str) -> bool:
    text = f"{title or ''} {overview or ''}".lower()
    return any(k in text for k in EXCLUDE_KEYWORDS)

def normalize_year(date_str: Optional[str]) -> Optional[int]:
    if not date_str:
        return None
    try:
        return int(date_str[:4])
    except Exception:
        return None

def passes_fame_filters(popularity: float, vote_count: int, caps: Tuple[float, int, int]) -> bool:
    max_pop, min_votes, max_votes = caps
    if popularity > max_pop:
        return False
    if vote_count < min_votes:
        return False
    if vote_count > max_votes:
        return False
    return True

def adaptive_caps(page: int, start_caps: Tuple[float, int, int]) -> Tuple[float, int, int]:
    """Gradually relax constraints as pages increase, to ensure we hit the target."""
    max_pop, min_votes, max_votes = start_caps
    # Every 20 pages, widen a bit
    widen_steps = page // 20
    max_pop = min(400.0, max_pop + 25.0 * widen_steps)
    min_votes = max(1, min_votes - 1 * widen_steps)
    # keep max_votes high enough
    max_votes = max_votes  # unchanged
    return (max_pop, min_votes, max_votes)

def collect_for_genre(genre_name: str, genre_id: int, target: int) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    seen_ids = set()

    start_caps = (MAX_POPULARITY, MIN_VOTE_COUNT, MAX_VOTE_COUNT)
    page = 1

    while len(rows) < target and page <= MAX_PAGES:
        caps_now = adaptive_caps(page, start_caps)
        items = discover_page(genre_id, page)
        # light shuffle to avoid clumping
        random.shuffle(items)

        for m in items:
            mid = m.get("id")
            if not mid or mid in seen_ids:
                continue

            title = m.get("title") or m.get("name") or ""
            overview = m.get("overview") or ""
            if is_erotic(title, overview):
                continue

            pop = float(m.get("popularity") or 0.0)
            vc = int(m.get("vote_count") or 0)

            if not passes_fame_filters(pop, vc, caps_now):
                continue

            # require an actual trailer/teaser (YouTube)
            try:
                vids = fetch_videos(mid)
            except requests.RequestException:
                continue

            trailer = pick_trailer_url(vids)
            if not trailer:
                continue

            rows.append({
                "title": title,
                "year": normalize_year(m.get("release_date")),
                "genre": genre_name,
                "tmdb_url": f"https://www.themoviedb.org/movie/{mid}",
                "youtube_trailer_url": trailer,
                "popularity": pop,
                "vote_count": vc,
                "original_language": m.get("original_language") or ""
            })
            seen_ids.add(mid)

            if len(rows) >= target:
                break

        print(f"{genre_name:8s} | page {page:>3} | collected {len(rows):>3}/{target} "
              f"(caps now: pop≤{caps_now[0]}, votes {caps_now[1]}–{caps_now[2]})")
        page += 1

    return rows

def main():
    all_rows: List[Dict[str, Any]] = []
    for gname, gid in GENRES.items():
        genre_rows = collect_for_genre(gname, gid, TARGET_PER_GENRE)
        if len(genre_rows) < TARGET_PER_GENRE:
            print(f"WARNING: {gname} collected {len(genre_rows)} < {TARGET_PER_GENRE}. "
                  f"You can raise MAX_POPULARITY or lower MIN_VOTE_COUNT and rerun.")
        all_rows.extend(genre_rows)

    df = pd.DataFrame(all_rows, columns=[
        "title", "year", "genre", "tmdb_url", "youtube_trailer_url",
        "popularity", "vote_count", "original_language"
    ])

    # Basic sanity: group counts
    counts = df.groupby("genre")["title"].count().to_dict()
    print("Counts per genre:", counts)
    print("Total rows:", len(df))

    # Write files
    df.to_excel("movies_dataset_480.xlsx", index=False)
    df.to_csv("movies_dataset_480.csv", index=False, encoding="utf-8")
    df.to_json("movies_dataset_480.json", orient="records", indent=2, force_ascii=False)
    print("Saved: movies_dataset_480.xlsx, movies_dataset_480.csv, movies_dataset_480.json")

if __name__ == "__main__":
    main()
