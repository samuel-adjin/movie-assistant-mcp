import z from "zod";
import { server } from "./server.js";
import { fetchMoviesFromTMDB } from "./api.js";

export const TMBD_API_BASE = "https://api.themoviedb.org/3";

const buildErrorResponse = (status: number) => ({
    content: [
        {
            type: "text" as const,
            text: `TMDB request failed with status ${status}.`,
        },
    ],
    isError: true,
});

server.registerTool(
    "search-movies",
    {
        description: "Search for movies using the TMDB API",
        inputSchema: z.object({
            query: z
                .string()
                .min(1)
                .describe("Movie title to search for"),
            year: z
                .number()
                .int()
                .optional()
                .describe("Optional release year"),
            page: z
                .number()
                .int()
                .min(1)
                .default(1),
        }),
    },
    async ({ query, year, page }) => {
        const params = new URLSearchParams({
            query,
            page: page.toString(),
            include_adult: "false",
            language: "en-US",
        });

        if (year) {
            params.set("primary_release_year", year.toString());
        }

        const { data, status } = await fetchMoviesFromTMDB(
            `${TMBD_API_BASE}/search/movie?${params.toString()}`
        );
        if (!data) {
            return buildErrorResponse(status);
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ ...data, query, year, page }, null, 2),
                },
            ],
        };
    },
);

server.registerTool(
    "get-movie-details",
    {
        description: "Get details for a specific movie using the TMDB API",
        inputSchema: z.object({
            movieId: z.number().int().positive().describe("TMDB movie ID"),
            language: z.string().default("en-US"),
        }),
    },
    async ({ movieId, language }) => {
        const { data, status } = await fetchMoviesFromTMDB(
            `${TMBD_API_BASE}/movie/${movieId}?language=${language}`
        );
        if (!data) {
            return buildErrorResponse(status);
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }
);

server.registerTool(
    "get-trending-movies",
    {
        description: "Get trending movies from the TMDB API",
        inputSchema: z.object({
            timeWindow: z.enum(["day", "week"]).default("day"),
            language: z.string().default("en-US"),
        }),
    },
    async ({ timeWindow, language }) => {
        const { data, status } = await fetchMoviesFromTMDB(
            `${TMBD_API_BASE}/trending/movie/${timeWindow}?language=${language}`
        );
        if (!data) {
            return buildErrorResponse(status);
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }
);

server.registerTool(
    "get-movie-recommendations",
    {
        description: "Get movie recommendations based on a specific movie using the TMDB API",
        inputSchema: z.object({
            movieId: z.number().int().positive(),
            page: z.number().int().min(1).default(1),
            language: z.string().default("en-US"),
        }),
    },
    async ({ movieId, page, language }) => {
        const params = new URLSearchParams({
            page: page.toString(),
            language,
        });

        const { data, status } = await fetchMoviesFromTMDB(
            `${TMBD_API_BASE}/movie/${movieId}/recommendations?${params.toString()}`
        );

        if (!data) {
            return buildErrorResponse(status);
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ ...data, movieId, page, language }, null, 2),
                },
            ],
        };
    }
);

server.registerTool(
    "discover-movies",
    {
        description: "Discover movies based on various criteria using the TMDB API",
        inputSchema: z.object({
            genreIds: z.array(z.number().int()).optional(),
            year: z.number().int().optional(),
            minimumRating: z.number().min(0).max(10).optional(),
            minimumVoteCount: z.number().int().optional(),
            minimumRuntime: z.number().int().optional(),
            maximumRuntime: z.number().int().optional(),
            originalLanguage: z.string().optional(),
            watchProviderIds: z.array(z.number().int()).optional(),
            watchRegion: z.string().length(2).optional(),
            monetizationType: z
                .enum(["flatrate", "free", "ads", "rent", "buy"])
                .optional(),
            sortBy: z
                .enum([
                    "popularity.desc",
                    "vote_average.desc",
                    "primary_release_date.desc",
                    "revenue.desc",
                ])
                .default("popularity.desc"),
            page: z.number().int().min(1).default(1),
        }),
    },
    async ({
        genreIds,
        year,
        minimumRating,
        minimumVoteCount,
        minimumRuntime,
        maximumRuntime,
        originalLanguage,
        watchProviderIds,
        watchRegion,
        monetizationType,
        sortBy,
        page,
    }) => {
        const params = new URLSearchParams({
            sort_by: sortBy,
            page: page.toString(),
            language: "en-US",
            include_adult: "false",
        });

        if (genreIds?.length) {
            params.set("with_genres", genreIds.join(","));
        }
        if (year) {
            params.set("primary_release_year", year.toString());
        }
        if (minimumRating !== undefined) {
            params.set("vote_average.gte", minimumRating.toString());
        }
        if (minimumVoteCount !== undefined) {
            params.set("vote_count.gte", minimumVoteCount.toString());
        }
        if (minimumRuntime !== undefined) {
            params.set("with_runtime.gte", minimumRuntime.toString());
        }
        if (maximumRuntime !== undefined) {
            params.set("with_runtime.lte", maximumRuntime.toString());
        }
        if (originalLanguage) {
            params.set("with_original_language", originalLanguage);
        }
        if (watchProviderIds?.length) {
            params.set("with_watch_providers", watchProviderIds.join(","));
        }
        if (watchRegion) {
            params.set("watch_region", watchRegion);
        }
        if (monetizationType) {
            params.set("with_watch_monetization_types", monetizationType);
        }

        const { data, status } = await fetchMoviesFromTMDB(
            `${TMBD_API_BASE}/discover/movie?${params.toString()}`
        );
        if (!data) {
            return buildErrorResponse(status);
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        {
                            ...data,
                            filters: {
                                genreIds,
                                year,
                                minimumRating,
                                minimumVoteCount,
                                minimumRuntime,
                                maximumRuntime,
                                originalLanguage,
                                watchProviderIds,
                                watchRegion,
                                monetizationType,
                                sortBy,
                                page,
                            },
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    }
);
