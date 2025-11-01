import manualGenreFilters from "./manualGenreFilters.json";

function toIdSet(values) {
    if (!Array.isArray(values)) {
        return new Set();
    }
    const normalized = values
        .map((value) => {
            if (value === null || value === undefined) {
                return null;
            }
            const trimmed = String(value).trim();
            return trimmed.length > 0 ? trimmed : null;
        })
        .filter(Boolean);
    return new Set(normalized);
}

function toTitleSet(values) {
    if (!Array.isArray(values)) {
        return new Set();
    }
    const normalized = values
        .map((value) => {
            if (value === null || value === undefined) {
                return null;
            }
            const trimmed = String(value).trim().toLowerCase();
            return trimmed.length > 0 ? trimmed : null;
        })
        .filter(Boolean);
    return new Set(normalized);
}

function mergeFilterConfigs(configs) {
    const excludeIds = new Set();
    const excludeTitles = new Set();
    const includeIds = new Set();
    const includeTitles = new Set();

    configs.forEach((config) => {
        const exclude = config?.exclude ?? {};
        const include = config?.includeOnly ?? {};

        toIdSet(exclude.ids).forEach((value) => excludeIds.add(value));
        toTitleSet(exclude.titles).forEach((value) => excludeTitles.add(value));

        toIdSet(include.ids).forEach((value) => includeIds.add(value));
        toTitleSet(include.titles).forEach((value) => includeTitles.add(value));
    });

    const hasRules =
        excludeIds.size > 0 ||
        excludeTitles.size > 0 ||
        includeIds.size > 0 ||
        includeTitles.size > 0;

    return hasRules
        ? {
            excludeIds,
            excludeTitles,
            includeIds,
            includeTitles
        }
        : null;
}

function collectManualConfigs({categoryId, requiredGenreIds, extraKeys}) {
    const configs = [];
    const fallback = manualGenreFilters?.default;
    if (fallback) {
        configs.push(fallback);
    }

    if (categoryId && manualGenreFilters?.[categoryId]) {
        configs.push(manualGenreFilters[categoryId]);
    }

    if (Array.isArray(requiredGenreIds)) {
        requiredGenreIds.forEach((genreId) => {
            const key = String(genreId);
            if (manualGenreFilters?.[key]) {
                configs.push(manualGenreFilters[key]);
            }
        });
    }

    if (Array.isArray(extraKeys)) {
        extraKeys.forEach((key) => {
            if (manualGenreFilters?.[key]) {
                configs.push(manualGenreFilters[key]);
            }
        });
    }

    return configs;
}

function resolveMovieTitle(movie) {
    return (
        movie?.title ||
        movie?.name ||
        movie?.original_title ||
        movie?.original_name ||
        ""
    );
}

export function isFilteredByManualRules(movie, options = {}) {
    if (!movie) {
        return false;
    }
    const configs = collectManualConfigs(options);
    const filters = mergeFilterConfigs(configs);
    if (!filters) {
        return false;
    }

    const idStr = movie.id === 0 || movie.id ? String(movie.id).trim() : null;
    const title = resolveMovieTitle(movie).trim().toLowerCase();

    const {excludeIds, excludeTitles, includeIds, includeTitles} = filters;

    if (includeIds.size > 0 || includeTitles.size > 0) {
        const matchesInclude =
            (idStr && includeIds.has(idStr)) ||
            (title && includeTitles.has(title));
        if (!matchesInclude) {
            return true;
        }
    }

    if ((idStr && excludeIds.has(idStr)) || (title && excludeTitles.has(title))) {
        return true;
    }

    return false;
}

export function getManualRuleSummary(options = {}) {
    const configs = collectManualConfigs(options);
    const filters = mergeFilterConfigs(configs);
    if (!filters) {
        return {
            hasRules: false,
            includeIds: [],
            includeTitles: [],
            excludeIds: [],
            excludeTitles: []
        };
    }

    const {includeIds, includeTitles, excludeIds, excludeTitles} = filters;
    return {
        hasRules: true,
        includeIds: Array.from(includeIds),
        includeTitles: Array.from(includeTitles),
        excludeIds: Array.from(excludeIds),
        excludeTitles: Array.from(excludeTitles)
    };
}
