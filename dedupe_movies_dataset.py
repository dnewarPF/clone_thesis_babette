import json
import os
import time
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

import requests
from dotenv import load_dotenv


ALLOWED_GENRES = {"Action", "Comedy", "Drama", "Thriller"}
DATASET_PATH = Path("public/movies_dataset_480.json")
API_BASE = "https://api.themoviedb.org/3/movie/{movie_id}"
RATE_DELAY_SECONDS = 0.3


def extract_movie_id(tmdb_url: str) -> str:
  return tmdb_url.rstrip("/").rsplit("/", 1)[-1]


def fetch_first_genre(movie_id: str, api_key: str, cache: Dict[str, str]) -> str:
  if movie_id in cache:
    return cache[movie_id]

  response = requests.get(
      API_BASE.format(movie_id=movie_id),
      params={"api_key": api_key},
      timeout=30
  )
  response.raise_for_status()
  genres = response.json().get("genres") or []
  primary = genres[0]["name"] if genres else None
  cache[movie_id] = primary
  time.sleep(RATE_DELAY_SECONDS)
  return primary


def main() -> None:
  load_dotenv()
  api_key = os.getenv("TMDB_API_KEY")
  if not api_key:
    raise SystemExit("TMDB_API_KEY is not set; cannot fetch genre metadata.")

  if not DATASET_PATH.exists():
    raise SystemExit(f"Dataset not found at {DATASET_PATH}")

  data = json.loads(DATASET_PATH.read_text(encoding="utf-8"))
  if not isinstance(data, list):
    raise SystemExit("Dataset is not a list.")

  grouped: Dict[str, List[dict]] = defaultdict(list)
  id_order: List[str] = []
  seen_ids = set()

  for entry in data:
    movie_id = extract_movie_id(entry["tmdb_url"])
    grouped[movie_id].append(entry)
    if movie_id not in seen_ids:
      id_order.append(movie_id)
      seen_ids.add(movie_id)

  cache: Dict[str, str] = {}
  deduped: List[dict] = []

  for movie_id in id_order:
    entries = grouped[movie_id]
    base_entry = entries[0].copy()
    primary_genre = fetch_first_genre(movie_id, api_key, cache)

    if primary_genre:
      if primary_genre not in ALLOWED_GENRES:
        # Fallback to an allowed genre already captured in the dataset.
        fallback = next((item["genre"] for item in entries if item["genre"] in ALLOWED_GENRES), None)
        base_entry["genre"] = fallback or primary_genre
      else:
        base_entry["genre"] = primary_genre
    deduped.append(base_entry)

  DATASET_PATH.write_text(json.dumps(deduped, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
  main()
