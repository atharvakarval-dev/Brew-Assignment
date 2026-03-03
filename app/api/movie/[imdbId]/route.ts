import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import type { ApiErrorResponse, MovieData } from "@/lib/types";
import { fetchMovie, isOmdbClientError } from "@/lib/omdb";
import { validateImdbId } from "@/lib/utils";

export const runtime = "edge";
export const preferredRegion = "auto";

interface RouteContext {
  params: Promise<{
    imdbId: string;
  }>;
}

const getCachedMovie = unstable_cache(
  async (imdbId: string): Promise<MovieData> => fetchMovie(imdbId),
  ["movie-data-by-imdb-id"],
  { revalidate: 3600 }
);

const MOVIE_CACHE_CONTROL = "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<MovieData | ApiErrorResponse>> {
  const start = performance.now();
  const { imdbId } = await context.params;

  if (!validateImdbId(imdbId)) {
    return NextResponse.json(
      {
        error: `Invalid IMDb ID '${imdbId}'. Expected format tt1234567 or tt12345678.`,
        statusCode: 400
      },
      { status: 400 }
    );
  }

  try {
    const movie = await getCachedMovie(imdbId);
    return NextResponse.json(movie, {
      status: 200,
      headers: {
        "Cache-Control": MOVIE_CACHE_CONTROL,
        "Server-Timing": `movie;dur=${(performance.now() - start).toFixed(1)}`
      }
    });
  } catch (error: unknown) {
    console.error("[app/api/movie/[imdbId]/route.ts][GET]", error);

    if (isOmdbClientError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode
        },
        {
          status: error.statusCode,
          headers: { "Server-Timing": `app;dur=${(performance.now() - start).toFixed(1)}` }
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Movie service is currently unavailable due to a downstream connectivity issue. Please retry shortly.",
        statusCode: 503
      },
      {
        status: 503,
        headers: { "Server-Timing": `app;dur=${(performance.now() - start).toFixed(1)}` }
      }
    );
  }
}
