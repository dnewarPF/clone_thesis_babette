"""
Rebuild the movies dataset so that:
- Each of the four focus genres (Action, Comedy, Drama, Thriller) has exactly 120 movies
- Every movie appears only once
- The assigned genre matches the first genre returned by TMDb for that movie
- Each movie has an available YouTube trailer/teaser

Usage:
    1) pip install requests python-dotenv
    2) Ensure TMDB_API_KEY is set in .env or environment variables
    3) python scripts/build_movies_dataset_primary_genre.py
"""

from __future__ import annotations

import json
import os
import random
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set

import requests
from dotenv import load_dotenv

CATEGORY_CONFIG = [
    {"id": "action", "label": "Action", "genre_id": 28},
    {"id": "comedy", "label": "Comedy", "genre_id": 35},
    {"id": "drama", "label": "Drama", "genre_id": 18},
    {"id": "thriller", "label": "Thriller", "genre_id": 53},
]
TARGET_PER_GENRE = 120
DATASET_PATH = Path("public/movies_dataset_480.json")
API_BASE = "https://api.themoviedb.org/3"
REQUEST_DELAY_SECONDS = 0.3  # keep within TMDb rate limits
MAX_PAGES = 500
UNSAFE_TERMS = {
    "adult",
    "bdsm",
    "brothel",
    "erotic",
    "erotica",
    "fetish",
    "gay",
    "hard core",
    "hardcore",
    "kink",
    "kinky",
    "lesbian",
    "naked",
    "nudist",
    "nudity",
    "nude",
    "orgy",
    "porn",
    "porno",
    "prostitute",
    "prostitution",
    "sensual",
    "seduce",
    "seduc",
    "seduction",
    "sexy",
    "sex",
    "sexual",
    "soft core",
    "softcore",
    "strip",
    "stripper",
    "xxx",
}
MANUAL_FILTERS_PATH = Path("src/utils/manualGenreFilters.json")


def load_manual_filters() -> Dict[str, Any]:
    if not MANUAL_FILTERS_PATH.exists():
        return {}
    return json.loads(MANUAL_FILTERS_PATH.read_text(encoding="utf-8"))


def to_id_set(values: Optional[List[Any]]) -> Set[str]:
    if not isinstance(values, list):
        return set()
    result = set()
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if text:
            result.add(text)
    return result


def to_title_set(values: Optional[List[Any]]) -> Set[str]:
    if not isinstance(values, list):
        return set()
    result = set()
    for value in values:
        if value is None:
            continue
        text = str(value).strip().lower()
        if text:
            result.add(text)
    return result


def merge_filter_configs(configs: List[Dict[str, Any]]) -> Optional[Dict[str, Set[str]]]:
    exclude_ids: Set[str] = set()
    exclude_titles: Set[str] = set()
    include_ids: Set[str] = set()
    include_titles: Set[str] = set()

    for config in configs:
        if not isinstance(config, dict):
            continue
        exclude = config.get("exclude") or {}
        include_only = config.get("includeOnly") or {}

        exclude_ids |= to_id_set(exclude.get("ids"))
        exclude_titles |= to_title_set(exclude.get("titles"))
        include_ids |= to_id_set(include_only.get("ids"))
        include_titles |= to_title_set(include_only.get("titles"))

    if not (exclude_ids or exclude_titles or include_ids or include_titles):
        return None

    return {
        "exclude_ids": exclude_ids,
        "exclude_titles": exclude_titles,
        "include_ids": include_ids,
        "include_titles": include_titles
    }


def get_manual_filter_keys(label: str) -> List[str]:
    trimmed = (label or "").strip().lower()
    if not trimmed:
        return []
    slug = trimmed.replace(" ", "-")
    return [trimmed] if slug == trimmed else [trimmed, slug]


def collect_manual_configs(
    filters: Dict[str, Any],
    category_id: Optional[str],
    required_genre_ids: Optional[List[int]],
    extra_keys: Optional[List[str]]
) -> List[Dict[str, Any]]:
    if not filters:
        return []
    configs: List[Dict[str, Any]] = []
    fallback = filters.get("default")
    if isinstance(fallback, dict):
        configs.append(fallback)

    if category_id and isinstance(filters.get(category_id), dict):
        configs.append(filters[category_id])

    if required_genre_ids:
        for gid in required_genre_ids:
            key = str(gid)
            config = filters.get(key)
            if isinstance(config, dict):
                configs.append(config)

    if extra_keys:
        for key in extra_keys:
            config = filters.get(key)
            if isinstance(config, dict):
                configs.append(config)

    return configs


def is_filtered_by_manual_rules(movie: Dict[str, Any], filters: Optional[Dict[str, Set[str]]]) -> bool:
    if not filters:
        return False

    movie_id = movie.get("id")
    id_str = str(movie_id).strip() if movie_id is not None else None
    title = (
        movie.get("title")
        or movie.get("name")
        or movie.get("original_title")
        or movie.get("original_name")
        or ""
    ).strip().lower()

    include_ids = filters.get("include_ids", set())
    include_titles = filters.get("include_titles", set())

    if include_ids or include_titles:
        matches_include = (
            (id_str and id_str in include_ids)
            or (title and title in include_titles)
        )
        if not matches_include:
            return True

    exclude_ids = filters.get("exclude_ids", set())
    exclude_titles = filters.get("exclude_titles", set())
    if (id_str and id_str in exclude_ids) or (title and title in exclude_titles):
        return True

    return False


def sleep() -> None:
    time.sleep(REQUEST_DELAY_SECONDS)


def fetch_json(session: requests.Session, path: str, params: Optional[Dict[str, Any]] = None, attempts: int = 3) -> Dict[str, Any]:
    url = f"{API_BASE}{path}"
    params = params or {}

    for attempt in range(attempts):
        try:
            response = session.get(url, params=params, timeout=30)
            if response.status_code == 429:
                time.sleep(1.5 * (attempt + 1))
                continue
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            if attempt == attempts - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
        finally:
            sleep()
    return {}


def pick_trailer_url(videos: Iterable[Dict[str, Any]]) -> Optional[str]:
    candidates: List[Dict[str, Any]] = [
        v for v in videos
        if (v.get("site") == "YouTube") and v.get("key")
    ]
    if not candidates:
        return None

    def score(video: Dict[str, Any]) -> tuple[int, int]:
        video_type = (video.get("type") or "").lower()
        type_score = 2 if video_type == "trailer" else (1 if video_type == "teaser" else 0)
        official_score = 1 if video.get("official") else 0
        return type_score, official_score

    best = max(candidates, key=score)
    return f"https://www.youtube.com/watch?v={best['key']}"


def normalize_year(value: Optional[str]) -> Optional[int]:
    if not value:
        return None
    try:
        return int(value[:4])
    except (ValueError, TypeError):
        return None


def is_unsafe(text: str) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in UNSAFE_TERMS)


def fetch_keywords(session: requests.Session, movie_id: int) -> Optional[List[str]]:
    payload = fetch_json(session, f"/movie/{movie_id}/keywords")
    raw_keywords = payload.get("keywords") or []
    names: List[str] = []
    seen: Set[str] = set()
    for item in raw_keywords:
        name = (item.get("name") or "").strip()
        if not name:
            continue
        lowered = name.lower()
        if lowered in seen:
            continue
        if is_unsafe(name):
            return None
        seen.add(lowered)
        names.append(name)
    return names


def main() -> None:
    load_dotenv()
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        raise SystemExit("TMDB_API_KEY is not set; please provide it in the environment or .env file.")

    session = requests.Session()
    session.params = {"api_key": api_key}
    session.headers.update({"Accept": "application/json"})

    results: List[Dict[str, Any]] = []
    used_movie_ids: set[int] = set()
    manual_filters = load_manual_filters()
    category_filters: Dict[str, Optional[Dict[str, Set[str]]]] = {}
    for category in CATEGORY_CONFIG:
        configs = collect_manual_configs(
            manual_filters,
            category_id=category.get("id"),
            required_genre_ids=[category.get("genre_id")] if category.get("genre_id") else None,
            extra_keys=get_manual_filter_keys(category.get("label", ""))
        )
        category_filters[category["id"]] = merge_filter_configs(configs)

    for category in CATEGORY_CONFIG:
        genre_name = category["label"]
        genre_id = category["genre_id"]
        filter_rules = category_filters.get(category["id"])

        collected: List[Dict[str, Any]] = []
        page = 1

        while len(collected) < TARGET_PER_GENRE and page <= MAX_PAGES:
            discover_params = {
                "with_genres": genre_id,
                "include_adult": "false",
                "sort_by": "popularity.desc",
                "page": page,
                "language": "en-US",
                "with_original_language": "",
                "vote_count.gte": 1,
            }
            page_data = fetch_json(session, "/discover/movie", discover_params)
            movies = page_data.get("results") or []
            if not movies:
                page += 1
                continue

            random.shuffle(movies)

            for movie_stub in movies:
                movie_id = movie_stub.get("id")
                if not movie_id or movie_id in used_movie_ids:
                    continue
                if movie_stub.get("adult"):
                    continue

                details = fetch_json(session, f"/movie/{movie_id}")
                genres = details.get("genres") or []
                if not genres:
                    continue
                primary_genre = genres[0].get("name")
                if primary_genre != genre_name:
                    continue

                title = details.get("title") or movie_stub.get("title") or ""
                overview = details.get("overview") or movie_stub.get("overview") or ""
                if is_unsafe(f"{title} {overview}"):
                    continue

                summary_for_filters = {
                    "id": movie_id,
                    "title": title,
                    "name": details.get("name") or movie_stub.get("name"),
                    "original_title": details.get("original_title") or movie_stub.get("original_title"),
                    "original_name": details.get("original_name") or movie_stub.get("original_name"),
                }
                if is_filtered_by_manual_rules(summary_for_filters, filter_rules):
                    continue

                backdrop_path = details.get("backdrop_path") or movie_stub.get("backdrop_path")
                poster_path = details.get("poster_path") or movie_stub.get("poster_path")
                if not (backdrop_path or poster_path):
                    continue

                keywords = fetch_keywords(session, movie_id)
                if not keywords:
                    continue

                videos_data = fetch_json(session, f"/movie/{movie_id}/videos")
                trailer_url = pick_trailer_url(videos_data.get("results") or [])
                if not trailer_url:
                    continue

                genre_ids = []
                stub_genres = movie_stub.get("genre_ids") or []
                if isinstance(stub_genres, list):
                    genre_ids.extend([gid for gid in stub_genres if isinstance(gid, int)])
                detail_genre_ids = [
                    g.get("id") for g in genres if isinstance(g, dict) and isinstance(g.get("id"), int)
                ]
                for gid in detail_genre_ids:
                    if gid not in genre_ids:
                        genre_ids.append(gid)

                row = {
                    "id": movie_id,
                    "title": title,
                    "original_title": details.get("original_title") or movie_stub.get("original_title") or title,
                    "overview": overview,
                    "genre_ids": genre_ids,
                    "year": normalize_year(details.get("release_date")),
                    "release_date": details.get("release_date"),
                    "genre": genre_name,
                    "tmdb_url": f"https://www.themoviedb.org/movie/{movie_id}",
                    "youtube_trailer_url": trailer_url,
                    "poster_path": poster_path,
                    "backdrop_path": backdrop_path,
                    "vote_average": float(details.get("vote_average") or movie_stub.get("vote_average") or 0.0),
                    "popularity": float(details.get("popularity") or movie_stub.get("popularity") or 0.0),
                    "vote_count": int(details.get("vote_count") or movie_stub.get("vote_count") or 0),
                    "original_language": details.get("original_language") or movie_stub.get("original_language") or "",
                    "keywords": keywords,
                }
                collected.append(row)
                used_movie_ids.add(movie_id)

                if len(collected) >= TARGET_PER_GENRE:
                    break

            page += 1

        if len(collected) < TARGET_PER_GENRE:
            raise SystemExit(f"Could not collect enough movies for {genre_name}: gathered {len(collected)}")

        results.extend(collected)
        print(f"{genre_name}: collected {len(collected)} movies.")

    results.sort(key=lambda item: (item["genre"], item["title"]))
    DATASET_PATH.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Dataset written to {DATASET_PATH} with {len(results)} movies.")


if __name__ == "__main__":
    main()
