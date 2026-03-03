import { z } from "zod";

import type { MovieData } from "@/lib/types";
import { validateImdbId, decodeHtmlEntities } from "@/lib/utils";

const omdbRatingSchema = z.object({
  Source: z.string(),
  Value: z.string()
});

const omdbMovieSchema = z.object({
  imdbID: z.string().default(""),
  Title: z.string().default(""),
  Year: z.string().default(""),
  Rated: z.string().default("N/A"),
  Released: z.string().default("N/A"),
  Runtime: z.string().default("N/A"),
  Genre: z.string().default(""),
  Director: z.string().default("N/A"),
  Writer: z.string().default("N/A"),
  Actors: z.string().default("N/A"),
  Plot: z.string().default("N/A"),
  Poster: z.string().default("N/A"),
  Ratings: z.array(omdbRatingSchema).default([]),
  imdbRating: z.string().default("N/A"),
  Response: z.enum(["True", "False"]),
  Error: z.string().optional()
});

export class OmdbClientError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "OmdbClientError";
    this.statusCode = statusCode;
  }
}

export function isOmdbClientError(error: unknown): error is OmdbClientError {
  return error instanceof OmdbClientError;
}

function getOmdbApiKey(): string {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    throw new OmdbClientError(
      "OMDB API key is missing. Set OMDB_API_KEY in your environment before requesting movie data.",
      500
    );
  }

  return apiKey;
}

export async function fetchMovie(imdbId: string): Promise<MovieData> {
  if (!validateImdbId(imdbId)) {
    throw new OmdbClientError(
      `Invalid IMDb ID format '${imdbId}'. Expected format tt1234567 or tt12345678.`,
      400
    );
  }

  const apiKey = getOmdbApiKey();
  const endpoint = `http://www.omdbapi.com/?i=${encodeURIComponent(
    imdbId
  )}&plot=full&apikey=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET"
    });
  } catch {
    throw new OmdbClientError(
      `Unable to reach OMDB while fetching '${imdbId}'. Please retry in a moment.`,
      503
    );
  }

  if (!response.ok) {
    throw new OmdbClientError(
      `OMDB request failed with status ${response.status} for IMDb ID '${imdbId}'.`,
      503
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new OmdbClientError(
      `OMDB returned malformed JSON for IMDb ID '${imdbId}'. Please retry later.`,
      503
    );
  }
  const parsedPayload = omdbMovieSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new OmdbClientError(
      "OMDB response did not match the expected movie schema. Please retry later.",
      503
    );
  }

  const movieData = parsedPayload.data;

  if (movieData.Response === "False") {
    if (movieData.Error?.toLowerCase().includes("movie not found")) {
      throw new OmdbClientError(
        `Movie '${imdbId}' not found in OMDB database. Please verify the IMDb ID and try again.`,
        404
      );
    }

    throw new OmdbClientError(
      movieData.Error ?? `OMDB could not resolve IMDb ID '${imdbId}'.`,
      404
    );
  }

  // Decode HTML entities in text fields
  return {
    ...movieData,
    Title: decodeHtmlEntities(movieData.Title),
    Plot: decodeHtmlEntities(movieData.Plot),
    Director: decodeHtmlEntities(movieData.Director),
    Writer: decodeHtmlEntities(movieData.Writer),
    Actors: decodeHtmlEntities(movieData.Actors)
  };
}
