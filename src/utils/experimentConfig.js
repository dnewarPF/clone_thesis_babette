import urls from "./urls";

export const CATEGORY_CONFIG = [
    {
        id: "action",
        label: "Action",
        url: `${urls.findActionMovies}&sort_by=popularity.desc&include_adult=false`,
        requiredGenreId: 28
    },
    {
        id: "comedy",
        label: "Comedy",
        url: `${urls.findComedyMovies}&sort_by=popularity.desc&include_adult=false`,
        requiredGenreId: 35
    },
    {
        id: "drama",
        label: "Drama",
        url: `${urls.findDramaMovies}&sort_by=popularity.desc&include_adult=false`,
        requiredGenreId: 18
    },
    {
        id: "thriller",
        label: "Thriller",
        url: `${urls.findThrillerMovies}&sort_by=popularity.desc&include_adult=false`,
        requiredGenreId: 53
    }
];

const BOOLEAN_FLAGS = [false, true];

export const EXPERIMENT_CONDITIONS = BOOLEAN_FLAGS.flatMap((useAdjectives) =>
    BOOLEAN_FLAGS.flatMap((usePreview) =>
        BOOLEAN_FLAGS.map((showRatings) => ({
            id: `${useAdjectives ? 1 : 0}${usePreview ? 1 : 0}${showRatings ? 1 : 0}`,
            useAdjectives,
            usePreview,
            showRatings
        }))
    )
);

export const ADJECTIVES = [
    "Captivating",
    "Enchanting",
    "Daring",
    "Heartwarming",
    "Intriguing",
    "Intense",
    "Magical",
    "Immersive",
    "Unpredictable",
    "Moving",
    "Gritty",
    "Brilliant",
    "Spectacular",
    "Thrilling",
    "Sparkling",
    "Stylish",
    "Bold",
    "Stunning",
    "Refreshing",
    "Uplifting",
    "Alluring",
    "Surprising",
    "Fiery"
];

export const MOVIES_PER_CATEGORY = 15;
export const ROUNDS_COUNT = 8;
export const MAX_PAGE_ATTEMPTS = 25;
