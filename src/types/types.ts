export interface TMDBPaginatedResponse<TItem> {
  page: number;
  results: TItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieSummary {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TMDBMovieDetails extends TMDBMovieSummary {
  budget?: number;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  homepage?: string | null;
  imdb_id?: string | null;
  runtime?: number | null;
  status?: string;
  tagline?: string;
}

export type SearchMoviesResponse = TMDBPaginatedResponse<TMDBMovieSummary>;

export interface ToolOutput {
  content: ToolData[];
}

export interface ToolData {
  type: "text";
  text: string;
}
