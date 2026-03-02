import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { analyzeAudienceSentiment, isAIClientError } from "@/lib/groq";
import { fetchMovie, isOmdbClientError } from "@/lib/omdb";
import type { ApiErrorResponse, SentimentResult } from "@/lib/types";
import { getMockReviewsByGenre, validateImdbId } from "@/lib/utils";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    imdbId: string;
  }>;
}

const getCachedSentiment = unstable_cache(
  async (imdbId: string): Promise<SentimentResult> => {
    const movie = await fetchMovie(imdbId);
    const reviews = getMockReviewsByGenre(movie.Genre, 6);
    const aiResult = await analyzeAudienceSentiment(movie, reviews);

    return {
      ...aiResult,
      cachedAt: new Date().toISOString()
    };
  },
  ["sentiment-by-imdb-id"],
  { revalidate: 86400 }
);

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<SentimentResult | ApiErrorResponse>> {
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
    const sentiment = await getCachedSentiment(imdbId);
    return NextResponse.json(sentiment, { status: 200 });
  } catch (error: unknown) {
    console.error("[app/api/sentiment/[imdbId]/route.ts][GET]", error);

    if (isOmdbClientError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode
        },
        { status: error.statusCode }
      );
    }

    if (isAIClientError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error:
          "AI sentiment service is temporarily unavailable. Please retry in a few moments.",
        statusCode: 503
      },
      { status: 503 }
    );
  }
}
