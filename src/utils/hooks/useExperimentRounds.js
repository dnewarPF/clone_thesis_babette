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
                                if (globalUsedIds.has(candidate.id)) {
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
