export interface MovieData {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  imdbRating: string;
  imdbVotes?: string;
  Response: "True" | "False";
  Error?: string;
}

export interface SentimentResult {
  sentiment: "positive" | "mixed" | "negative";
  score: number;
  summary: string;
  insights: string[];
  reviews?: {
    author: string;
    content: string;
    avatar?: string;
  }[];
  cachedAt: string;
}

export interface ApiErrorResponse {
  error: string;
  statusCode: number;
}

export type ParsedSentiment = Omit<SentimentResult, "cachedAt">;
