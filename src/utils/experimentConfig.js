import urls from "./urls";

export const CATEGORY_CONFIG = [
    {
        id: "action",
        label: "Action",
        url: `${urls.findActionMovies}&sort_by=popularity.desc&include_adult=false`
    },
    {
        id: "comedy",
        label: "Comedy",
        url: `${urls.findComedyMovies}&sort_by=popularity.desc&include_adult=false`
    },
    {
        id: "drama",
        label: "Drama",
        url: `${urls.findDramaMovies}&sort_by=popularity.desc&include_adult=false`
    },
    {
        id: "thriller",
        label: "Thriller",
        url: `${urls.findThrillerMovies}&sort_by=popularity.desc&include_adult=false`
    },
    {
        id: "romance",
        label: "Romance",
        url: `${urls.findRomanceMovies}&sort_by=popularity.desc&include_adult=false`
    },
    {
        id: "documentary",
        label: "Documentary",
        url: `${urls.findDocumentaries}&sort_by=popularity.desc&include_adult=false`
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

export const MOVIES_PER_CATEGORY = 10;
export const ROUNDS_COUNT = 8;
export const MAX_PAGE_ATTEMPTS = 25;
