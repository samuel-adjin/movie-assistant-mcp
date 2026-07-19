
function getTmdbCredentials() {
    const bearerToken = process.env.TMDB_API_KEY ?? process.env.API_TOKEN_READ_ONLY;
    const apiKey = process.env.TMDB_API_KEY_V3 ?? process.env.API_KEY;

    return { bearerToken, apiKey };
}

export const fetchMoviesFromTMDB = async (url: string) => {
    const parsedUrl = new URL(url);
    const { bearerToken, apiKey } = getTmdbCredentials();

    if (!bearerToken && apiKey) {
        parsedUrl.searchParams.set("api_key", apiKey);
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json;charset=utf-8",
    };

    if (bearerToken) {
        headers.Authorization = `Bearer ${bearerToken}`;
    }

    const response = await fetch(parsedUrl.toString(), {
        headers,
    });

    if (!response.ok) {
        return {
            data: null,
            status: response.status,
        };
    }

    return {
        data: await response.json(),
        status: response.status,
    };
};
