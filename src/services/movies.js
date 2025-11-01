function extractYouTubeId(url) {
  if (typeof url !== "string" || url.trim() === "") {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname ?? "";
    if (host.includes("youtu")) {
      const searchId = parsed.searchParams.get("v");
      if (searchId) {
        return searchId;
      }
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      if (pathSegments.length > 0) {
        return pathSegments[pathSegments.length - 1];
      }
    }
  } catch (err) {
    // Ignore parsing issues and fallback to regex extraction.
  }

  const match = url.match(
    /(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? match[1] : null;
}

export async function loadMovies() {
  const res = await fetch("/movies_dataset_480.json");
  if (!res.ok) {
    throw new Error("Failed to load movies_dataset_480.json");
  }
  const data = await res.json();
  return data.map((m) => {
    const baseId = m.id ?? `${m.title}-${m.year ?? "NA"}`;
    const normalizedId = typeof baseId === "number" ? String(baseId) : baseId;
    const youtubeTrailerUrl =
      m.youtube_trailer_url ?? m.youtubeTrailerUrl ?? null;
    const youtubeTrailerId = extractYouTubeId(youtubeTrailerUrl ?? "");
    const keywords = Array.isArray(m.keywords)
      ? m.keywords
          .map((keyword) =>
            typeof keyword === "string" ? keyword : String(keyword ?? "")
          )
          .filter(Boolean)
      : [];
    const genreIds = Array.isArray(m.genre_ids)
      ? m.genre_ids.filter((gid) => typeof gid === "number")
      : [];
    const posterPath = m.poster_path ?? null;
    const backdropPath = m.backdrop_path ?? null;

    return {
      id: normalizedId,
      tmdbId: m.id ?? null,
      title: m.title,
      originalTitle: m.original_title ?? null,
      year: m.year ?? null,
      releaseDate: m.release_date ?? null,
      release_date: m.release_date ?? null,
      genre: m.genre,
      genreIds,
      genre_ids: genreIds,
      trailerUrl: youtubeTrailerUrl,
      youtubeTrailerUrl,
      youtube_trailer_url: youtubeTrailerUrl,
      youtubeTrailerId,
      tmdbUrl: m.tmdb_url ?? null,
      tmdb_url: m.tmdb_url ?? null,
      popularity: m.popularity ?? null,
      voteCount: m.vote_count ?? null,
      vote_count: m.vote_count ?? null,
      language: m.original_language ?? null,
      original_language: m.original_language ?? null,
      rating: m.vote_average ?? null,
      vote_average: m.vote_average ?? null,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      posterPath,
      backdropPath,
      overview: m.overview ?? "",
      keywords,
      raw: m
    };
  });
}
