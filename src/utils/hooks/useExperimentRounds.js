import {useEffect, useMemo, useState} from "react";
import {
    ADJECTIVES,
    CATEGORY_CONFIG,
    EXPERIMENT_CONDITIONS,
    MAX_PAGE_ATTEMPTS,
    MOVIES_PER_CATEGORY,
    ROUNDS_COUNT
} from "../experimentConfig";

function withPage(url, page) {
    return `${url}&page=${page}`;
}

function sanitizeMovie(movie) {
    return movie && (movie.backdrop_path || movie.poster_path);
}

export function useExperimentRounds() {
    const [state, setState] = useState({
        isLoading: true,
        rounds: [],
        error: null
    });

    const adjectives = useMemo(() => {
        const pool = [...ADJECTIVES];
        if (pool.length === 0) {
            pool.push("Recommended");
        }
        return pool;
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const fetchRounds = async () => {
            const rounds = [];
            const globalUsedIds = new Set();
            const categoryPageTracker = CATEGORY_CONFIG.reduce((acc, category) => {
                acc[category.id] = 1;
                return acc;
            }, {});
            let adjectiveCursor = 0;

            try {
                const API_URL = process.env.REACT_APP_API_URL;
                const API_KEY = process.env.REACT_APP_API_KEY;

                async function fetchKeywords(movieId) {
                    if (!API_URL || !API_KEY || !movieId) return [];
                    // Try movie keywords first, then TV
                    try {
                        const res = await fetch(`${API_URL}/movie/${movieId}/keywords?api_key=${API_KEY}`);
                        if (res.ok) {
                            const json = await res.json();
                            const list = Array.isArray(json?.keywords) ? json.keywords : [];
                            const names = list.map((k) => k?.name).filter(Boolean);
                            if (names.length) return names;
                        }
                    } catch (_) {}
                    try {
                        const resTv = await fetch(`${API_URL}/tv/${movieId}/keywords?api_key=${API_KEY}`);
                        if (resTv.ok) {
                            const jsonTv = await resTv.json();
                            const listTv = Array.isArray(jsonTv?.results) ? jsonTv.results : [];
                            return listTv.map((k) => k?.name).filter(Boolean);
                        }
                    } catch (_) {}
                    return [];
                }

                function containsUnsafeKeyword(names) {
                    if (!Array.isArray(names) || !names.length) return false;
                    const unsafe = [
                        "softcore",
                        "soft core",
                        "hardcore",
                        "hard core",
                        "lesbian",
                        "gay",
                        "sexy",
                        "erotic",
                        "erotica",
                        "adult",
                        "porn",
                        "xxx",
                        "nudity",
                        "nude",
                        "sexual",
                        "sex"
                    ];
                    const lowered = names.map((n) => String(n).toLowerCase());
                    return lowered.some((n) => unsafe.some((u) => n.includes(u)));
                }

                for (let roundIndex = 0; roundIndex < ROUNDS_COUNT; roundIndex += 1) {
                    const condition = EXPERIMENT_CONDITIONS[roundIndex];
                    if (!condition) {
                        break;
                    }

                    const categories = [];
                    for (const category of CATEGORY_CONFIG) {
                        const selection = [];
                        let attempts = 0;
                        let page = categoryPageTracker[category.id];

                        while (selection.length < MOVIES_PER_CATEGORY && attempts < MAX_PAGE_ATTEMPTS) {
                            const response = await fetch(withPage(category.url, page));
                            if (!response.ok) {
                                throw new Error(`Could not fetch data for ${category.label} (page ${page}).`);
                            }
                            const payload = await response.json();
                            const candidates = payload?.results ?? [];

                            for (const candidate of candidates) {
                                if (!sanitizeMovie(candidate)) {
                                    continue;
                                }
                                if (category.requiredGenreId) {
                                    const candidateGenres = Array.isArray(candidate.genre_ids)
                                        ? candidate.genre_ids
                                        : [];
                                    if (!candidateGenres.includes(category.requiredGenreId)) {
                                        continue;
                                    }
                                }
                                // Filter out adult / erotic content early
                                const titleLc = (candidate.title || candidate.name || "").toLowerCase();
                                const overviewLc = (candidate.overview || "").toLowerCase();
                                const unsafeTerms = [
                                    "erotic",
                                    "sex",
                                    "sexual",
                                    "nudity",
                                    "nude",
                                    "porn",
                                    "xxx",
                                    "adult"
                                ];
                                if (
                                    candidate.adult ||
                                    unsafeTerms.some(t => titleLc.includes(t) || overviewLc.includes(t))
                                ) {
                                    continue;
                                }
                                if (globalUsedIds.has(candidate.id)) {
                                    continue;
                                }

                                // Fetch keywords once to both validate presence (when needed)
                                // and filter out unsafe content by trefwoorden
                                const keywordNames = await fetchKeywords(candidate.id);
                                if (containsUnsafeKeyword(keywordNames)) {
                                    continue;
                                }
                                if (condition.useAdjectives && keywordNames.length === 0) {
                                    continue;
                                }

                                const adjective = adjectives[adjectiveCursor % adjectives.length];
                                adjectiveCursor += 1;

                                selection.push({
                                    ...candidate,
                                    experimentMeta: {
                                        adjective
                                    }
                                });
                                globalUsedIds.add(candidate.id);
                                if (selection.length === MOVIES_PER_CATEGORY) {
                                    break;
                                }
                            }

                            attempts += 1;
                            page += 1;
                        }

                        if (selection.length < MOVIES_PER_CATEGORY) {
                            throw new Error(`Not enough unique movies found for ${category.label}.`);
                        }

                        categoryPageTracker[category.id] = page;
                        categories.push({
                            ...category,
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

                if (!isCancelled) {
                    setState({isLoading: false, rounds, error: null});
                }
            } catch (err) {
                if (!isCancelled) {
                    setState({isLoading: false, rounds: [], error: err});
                }
            }
        };

        fetchRounds();

        return () => {
            isCancelled = true;
        };
    }, [adjectives]);

    return state;
}
