import {
  ADJECTIVES,
  CATEGORY_CONFIG,
  EXPERIMENT_CONDITIONS,
  MOVIES_PER_CATEGORY,
  ROUNDS_COUNT
} from "./experimentConfig";
import {isFilteredByManualRules} from "./manualGenreFilterUtils";
import {loadMovies} from "../services/movies";
import urls from "./urls";

function sanitizeMovie(movie) {
  return movie && (movie.backdrop_path || movie.poster_path);
}

function shuffle(array) {
  const copy = Array.isArray(array) ? [...array] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getManualFilterKeys(label) {
  if (typeof label !== "string") {
    return [];
  }
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }
  const slug = trimmed.replace(/\s+/g, "-");
  return slug === trimmed ? [trimmed] : [trimmed, slug];
}

function prepareMovieForSelection(movie, adjective, keywords) {
  return {
    ...movie,
    experimentMeta: {
      adjective,
      keywords,
      trailerId: movie.youtubeTrailerId ?? null
    }
  };
}

function collectImageUrls(rounds) {
  const results = new Set();
  rounds.forEach((round) => {
    round.categories.forEach((category) => {
      category.movies.forEach((movie) => {
        if (movie.backdrop_path) {
          results.add(`${urls.findImagesUrl}${movie.backdrop_path}`);
        }
        if (movie.poster_path) {
          results.add(`${urls.findImagesUrl}${movie.poster_path}`);
        }
      });
    });
  });
  return results;
}

function preloadImages(urlsToPreload) {
  if (
    !urlsToPreload.size ||
    typeof window === "undefined" ||
    typeof window.Image === "undefined"
  ) {
    return Promise.resolve();
  }

  return Promise.all(
    Array.from(urlsToPreload).map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        })
    )
  );
}

async function buildExperimentRounds() {
  const adjectivesPool = ADJECTIVES.length > 0 ? [...ADJECTIVES] : ["Recommended"];
  const allMovies = await loadMovies();

  const moviesByCategory = CATEGORY_CONFIG.reduce((acc, category) => {
    const pool = allMovies.filter((movie) => {
      const genre = (movie.genre || "").toLowerCase();
      return genre === category.label.toLowerCase();
    });
    acc[category.id] = shuffle(pool.filter(sanitizeMovie));
    return acc;
  }, {});

  const categoryQueues = CATEGORY_CONFIG.reduce((acc, category) => {
    acc[category.id] = {
      pool: moviesByCategory[category.id] ?? [],
      cursor: 0
    };
    return acc;
  }, {});

  const randomizedConditions = shuffle([...EXPERIMENT_CONDITIONS]);
  const totalRounds = Math.min(ROUNDS_COUNT, randomizedConditions.length);
  const rounds = [];
  const globalUsedIds = new Set();
  let adjectiveCursor = 0;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const condition = randomizedConditions[roundIndex];
    if (!condition) {
      break;
    }

    const categories = [];

    for (const category of CATEGORY_CONFIG) {
      const queue = categoryQueues[category.id];
      if (!queue) {
        throw new Error(`Missing movie pool for ${category.label}`);
      }
      const selection = [];

      while (
        selection.length < MOVIES_PER_CATEGORY &&
        queue.cursor < queue.pool.length
      ) {
        const baseMovie = queue.pool[queue.cursor];
        queue.cursor += 1;

        if (!baseMovie || !sanitizeMovie(baseMovie)) {
          continue;
        }
        if (globalUsedIds.has(baseMovie.id)) {
          continue;
        }
        if (category.requiredGenreId) {
          const genrePool = Array.isArray(baseMovie.genreIds)
            ? baseMovie.genreIds
            : Array.isArray(baseMovie.genre_ids)
            ? baseMovie.genre_ids
            : [];
          if (!genrePool.includes(category.requiredGenreId)) {
            continue;
          }
        }

        const manualFilterKeys = getManualFilterKeys(category.label);
        if (
          isFilteredByManualRules(baseMovie, {
            categoryId: category.id,
            requiredGenreIds: category.requiredGenreId
              ? [category.requiredGenreId]
              : [],
            extraKeys: manualFilterKeys
          })
        ) {
          continue;
        }

        const keywords = Array.isArray(baseMovie.keywords)
          ? baseMovie.keywords.filter(Boolean)
          : [];
        if (condition.useAdjectives && keywords.length === 0) {
          continue;
        }

        const adjective =
          adjectivesPool[adjectiveCursor % adjectivesPool.length];
        adjectiveCursor += 1;

        const enrichedMovie = prepareMovieForSelection(
          baseMovie,
          adjective,
          keywords.slice(0, 5)
        );

        selection.push(enrichedMovie);
        globalUsedIds.add(baseMovie.id);
      }

      if (selection.length < MOVIES_PER_CATEGORY) {
        throw new Error(`Not enough movies available for ${category.label}.`);
      }

      categories.push({
        id: category.id,
        label: category.label,
        requiredGenreId: category.requiredGenreId,
        movies: selection
      });
    }

    rounds.push({
      id: roundIndex,
      label: `Round ${roundIndex + 1}`,
      config: condition,
      categories
    });
  }

  const imageUrls = collectImageUrls(rounds);
  await preloadImages(imageUrls);

  return {rounds};
}

let cachePromise = null;
let cachedResult = null;

export function preloadExperimentRounds() {
  if (!cachePromise) {
    cachePromise = buildExperimentRounds()
      .then((result) => {
        cachedResult = result;
        return result;
      })
      .catch((error) => {
        cachePromise = null;
        throw error;
      });
  }
  return cachePromise;
}

export function getCachedExperimentRounds() {
  return cachedResult;
}

export function clearExperimentRoundsCache() {
  cachePromise = null;
  cachedResult = null;
}
