import { z } from "zod";
import { server } from "./server.ts";

server.registerPrompt(
    "plan-movie-night",
    {
        title: "Plan a Movie Night",

        description:
            "Create personalized movie recommendations based on genre, mood, and audience.",

        argsSchema: z.object({
            genre: z
                .string()
                .describe("The preferred movie genre, such as comedy or action"),

            mood: z
                .string()
                .describe("The desired mood, such as relaxing, exciting, or emotional"),

            audience: z
                .string()
                .describe("The target audience, such as family, adults, or children"),

            numberOfMovies: z.coerce
                .number()
                .int()
                .min(1)
                .max(20)
                .default(5)
                .describe("The number of movies to recommend"),
        }),
    },

    async ({ genre, mood, audience, numberOfMovies }) => {
        return {
            description: `Movie-night recommendations for ${audience}`,

            messages: [
                {
                    role: "user" as const,

                    content: {
                        type: "text" as const,

                        text: `
                                    Help me plan a movie night.

                                    The user's preferences are:

                                    - Genre: ${genre}
                                    - Mood: ${mood}
                                    - Audience: ${audience}
                                    - Number of movies: ${numberOfMovies}

                                    Follow these instructions:

                                    1. Use the available movie tools to find movies matching the requested genre.
                                    2. Consider the requested mood and target audience.
                                    3. Recommend exactly ${numberOfMovies} movies when enough suitable results are available.
                                    4. For each movie, include:
                                    - Title
                                    - Release year
                                    - Rating
                                    - Short overview
                                    - Why it matches the user's preferences
                                    5. Do not invent movie information.
                                    6. Base factual movie information on the results returned by the available tools.
                                                `.trim(),
                    },
                },
            ],
        };
    },
);


server.registerPrompt(
    "compare-movies",
    {
        title: "Compare Movies",

        description:
            "Compare two movies based on ratings, popularity, release information, and other available details.",

        argsSchema: z.object({
            firstMovie: z
                .string()
                .min(1)
                .describe("The title of the first movie to compare"),

            secondMovie: z
                .string()
                .min(1)
                .describe("The title of the second movie to compare"),

            comparisonFocus: z
                .string()
                .optional()
                .describe(
                    "The specific aspect to focus on, such as ratings, popularity, story, cast, or box office performance",
                ),
        }),
    },

    ({ firstMovie, secondMovie, comparisonFocus }) => {
        const focus =
            comparisonFocus ??
            "overall quality, ratings, popularity, story, and release information";

        return {
            description: `Compare ${firstMovie} and ${secondMovie}`,

            messages: [
                {
                    role: "user" as const,

                    content: {
                        type: "text" as const,

                        text: `
                        Compare the following movies:

                        - First movie: ${firstMovie}
                        - Second movie: ${secondMovie}
                        - Comparison focus: ${focus}

                        Follow these instructions:

                        1. Use the search-movies tool to find both movies.
                        2. Use the get-movie-details tool to retrieve accurate details about each movie.
                        3. Confirm that the selected results match the requested movie titles.
                        4. Compare the movies using the following available information:
                        - Release date
                        - Genres
                        - Rating
                        - Number of votes
                        - Popularity
                        - Runtime
                        - Overview
                        - Budget and revenue, when available
                        5. Pay particular attention to: ${focus}.
                        6. Present the main information in a clear comparison table.
                        7. Explain the strengths and weaknesses of each movie.
                        8. Give a final recommendation and explain which movie may be the better choice.
                        9. If the requested comparison information is unavailable, clearly say so.
                        10. Do not invent ratings, reviews, box-office figures, or other movie information.
            `.trim(),
                    },
                },
            ],
        };
    },
);


server.registerPrompt(
    "create-watchlist",
    {
        title: "Create Watchlist",

        description:
            "Create a personalized movie watchlist based on genre, rating, release period, and watchlist size.",

        argsSchema: z.object({
            genre: z
                .string()
                .min(1)
                .describe("The genre of movies to include in the watchlist"),

            minimumRating: z.coerce
                .number()
                .min(0)
                .max(10)
                .optional()
                .describe("The minimum TMDB rating for movies to include"),

            releasePeriod: z
                .string()
                .optional()
                .describe(
                    "The preferred release period, such as after 2015, the 1990s, or between 2000 and 2010",
                ),

            watchlistSize: z.coerce
                .number()
                .int()
                .min(1)
                .max(20)
                .default(5)
                .describe("The number of movies to include in the watchlist"),
        }),
    },

    ({ genre, minimumRating, releasePeriod, watchlistSize }) => {
        const ratingRequirement =
            minimumRating !== undefined
                ? `Movies should have a rating of at least ${minimumRating}.`
                : "There is no minimum rating requirement.";

        const periodRequirement = releasePeriod
            ? `Prefer movies released during this period: ${releasePeriod}.`
            : "There is no specific release-period requirement.";

        return {
            description: `Create a ${watchlistSize}-movie ${genre} watchlist`,

            messages: [
                {
                    role: "user" as const,

                    content: {
                        type: "text" as const,

                        text: `
                        Create a personalized movie watchlist using these preferences:

                        - Genre: ${genre}
                        - Watchlist size: ${watchlistSize}
                        - Rating requirement: ${ratingRequirement}
                        - Release requirement: ${periodRequirement}

                        Follow these instructions:

                        1. Use the discover-movies tool to find movies in the requested genre.
                        2. Apply the minimum-rating requirement when one is provided.
                        3. Apply the release-period requirement when one is provided.
                        4. Use the get-movie-details tool to verify the strongest candidates.
                        5. Remove duplicate and irrelevant results.
                        6. Select exactly ${watchlistSize} movies when enough suitable movies are available.
                        7. Order the watchlist from strongest to weakest recommendation.
                        8. For each movie, include:
                        - Title
                        - Release year
                        - Rating
                        - Genres
                        - Short overview
                        - Reason it belongs on the watchlist
                        9. Clearly mention when fewer than ${watchlistSize} movies satisfy the requirements.
                        10. Do not invent movie information.
                                    `.trim(),
                    },
                },
            ],
        };
    },
);


server.registerPrompt(
    "find-similar-movies",
    {
        title: "Find Similar Movies",

        description:
            "Find movies similar to a selected movie based on genre, story, mood, cast, or other available information.",

        argsSchema: z.object({
            movieTitle: z
                .string()
                .min(1)
                .describe("The title of the original movie"),

            numberOfMovies: z.coerce
                .number()
                .int()
                .min(1)
                .max(20)
                .default(5)
                .describe("The number of similar movies to recommend"),

            similarityFocus: z
                .string()
                .optional()
                .describe(
                    "The aspect to prioritize, such as genre, story, mood, cast, or director",
                ),
        }),
    },

    ({ movieTitle, numberOfMovies, similarityFocus }) => {
        const focus =
            similarityFocus ??
            "genre, themes, story, mood, and overall viewing experience";

        return {
            description: `Find movies similar to ${movieTitle}`,

            messages: [
                {
                    role: "user" as const,

                    content: {
                        type: "text" as const,

                        text: `
                        Find ${numberOfMovies} movies similar to "${movieTitle}".

                        Prioritize similarity based on:

                        ${focus}

                        Follow these instructions:

                        1. Use the search-movies tool to find "${movieTitle}".
                        2. Use the get-movie-details tool to understand its genres, overview, rating, release date, and other available details.
                        3. Use the get-movie-recommendations tool to retrieve recommended movies.
                        4. Use the discover-movies tool when additional candidates are needed.
                        5. Inspect the details of the strongest candidates.
                        6. Recommend exactly ${numberOfMovies} movies when enough suitable results are available.
                        7. For every recommendation, include:
                        - Title
                        - Release year
                        - Rating
                        - Short overview
                        - Explanation of how it is similar to "${movieTitle}"
                        8. Focus particularly on: ${focus}.
                        9. Do not claim that two movies are similar based on information that was not returned by the tools.
                        10. Do not invent movie details.
                                    `.trim(),
                    },
                },
            ],
        };
    },
);


server.registerPrompt(
    "weekend-movie-picks",
    {
        title: "Weekend Movie Picks",

        description:
            "Create personalized weekend movie recommendations based on mood, audience, and preferred genres.",

        argsSchema: z.object({
            mood: z
                .string()
                .min(1)
                .describe(
                    "The desired mood, such as relaxing, exciting, funny, or emotional",
                ),

            audience: z
                .string()
                .min(1)
                .describe(
                    "The target audience, such as adults, family, children, friends, or couples",
                ),

            preferredGenres: z
                .string()
                .min(1)
                .describe(
                    "Comma-separated preferred genres, such as comedy, action, science fiction",
                ),

            numberOfMovies: z.coerce
                .number()
                .int()
                .min(1)
                .max(20)
                .default(5)
                .describe("The number of movies to recommend"),
        }),
    },

    ({ mood, audience, preferredGenres, numberOfMovies }) => {
        const genres = preferredGenres
            .split(",")
            .map((genre) => genre.trim())
            .filter(Boolean);

        const formattedGenres = genres.join(", ");

        return {
            description: `Create ${numberOfMovies} weekend movie picks`,

            messages: [
                {
                    role: "user" as const,

                    content: {
                        type: "text" as const,

                        text: `
                            Create a weekend movie recommendation list using these preferences:

                            - Mood: ${mood}
                            - Audience: ${audience}
                            - Preferred genres: ${formattedGenres}
                            - Number of movies: ${numberOfMovies}

                            Follow these instructions:

                            1. Use the get-trending-movies tool to identify currently trending options.
                            2. Use the discover-movies tool to find movies in the preferred genres.
                            3. Use the get-movie-details tool to inspect the strongest candidates.
                            4. Consider whether each movie matches the requested mood and audience.
                            5. Select a varied collection instead of choosing movies that are all too similar.
                            6. Recommend exactly ${numberOfMovies} movies when enough suitable results are available.
                            7. For each movie, include:
                            - Title
                            - Release year
                            - Rating
                            - Genre
                            - Short overview
                            - Why it is a good weekend choice
                            8. Clearly state when audience suitability cannot be confirmed from the available data.
                            9. Do not invent movie details or content-rating information.
                                        `.trim(),
                    },
                },
            ],
        };
    },
);


server.registerPrompt(
    "summarize-trending-movies",
    {
        title: "Summarize Trending Movies",

        description:
            "Retrieve and summarize movies currently trending for the day or week.",

        argsSchema: z.object({
            timeWindow: z
                .enum(["day", "week"])
                .default("day")
                .describe("Whether to retrieve daily or weekly trending movies"),

            numberOfMovies: z.coerce
                .number()
                .int()
                .min(1)
                .max(20)
                .default(5)
                .describe("The number of trending movies to summarize"),

            genrePreference: z
                .string()
                .optional()
                .describe("A preferred movie genre"),
        }),
    },

    ({ timeWindow, numberOfMovies, genrePreference }) => {
        const genreInstruction = genrePreference
            ? `Give preference to movies in the "${genrePreference}" genre.`
            : "There is no preferred genre.";

        return {
            description: `Summarize ${numberOfMovies} movies trending this ${timeWindow}`,

            messages: [
                {
                    role: "user" as const,

                    content: {
                        type: "text" as const,

                        text: `
                            Summarize movies that are trending for the current ${timeWindow}.

                            Requirements:

                            - Number of movies: ${numberOfMovies}
                            - Genre preference: ${genreInstruction}

                            Follow these instructions:

                            1. Use the get-trending-movies tool with the "${timeWindow}" time window.
                            2. Select ${numberOfMovies} movies from the results.
                            3. Apply the genre preference when one is provided.
                            4. Use the get-movie-details tool when additional information is needed.
                            5. For every movie, include:
                            - Title
                            - Release date
                            - Rating
                            - Popularity, when available
                            - Short overview
                            6. Give a brief summary of the overall trending list.
                            7. Clearly distinguish factual tool data from your own interpretation.
                            8. Do not claim to know why a movie is trending unless the available data supports that conclusion.
                            9. Do not invent movie information.
                                        `.trim(),
                    },
                },
            ],
        };
    },
);