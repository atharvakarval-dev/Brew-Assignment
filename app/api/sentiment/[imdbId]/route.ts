import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { analyzeAudienceSentiment, isAIClientError } from "@/lib/groq";
import { fetchMovie, isOmdbClientError } from "@/lib/omdb";
import { telemetry } from "@/lib/telemetry";
import { getTMDBReviews } from "@/lib/tmdb";
import type { ApiErrorResponse, SentimentResult } from "@/lib/types";
import { getMockReviewsByGenre, validateImdbId } from "@/lib/utils";

export const runtime = "nodejs";
export const preferredRegion = "auto";

interface RouteContext {
  params: Promise<{
    imdbId: string;
  }>;
}

type ReviewItem = NonNullable<SentimentResult["reviews"]>[number];

const MIN_REVIEW_COUNT = 3;
const MAX_REVIEW_LENGTH = 420;
const SENTIMENT_CACHE_CONTROL = "public, max-age=60, s-maxage=86400, stale-while-revalidate=604800";

function toReviewObjects(reviews: string[]): ReviewItem[] {
  return reviews.map((content, index) => ({
    author: `Viewer ${index + 1}`,
    content
  }));
}

function trimReviewPayload(reviews: ReviewItem[]): ReviewItem[] {
  return reviews.map((review) => ({
    ...review,
    content: review.content.slice(0, MAX_REVIEW_LENGTH)
  }));
}

const getCachedSentiment = unstable_cache(
  async (imdbId: string): Promise<{ sentiment: SentimentResult; aiDuration: number }> => {
    const [movieResult, tmdbResult] = await Promise.allSettled([
      fetchMovie(imdbId),
      getTMDBReviews(imdbId) as Promise<ReviewItem[]>
    ]);

    if (movieResult.status === "rejected") {
      throw movieResult.reason;
    }

    const movie = movieResult.value;

    let reviews: ReviewItem[];
    try {
      if (tmdbResult.status === "fulfilled" && tmdbResult.value.length >= MIN_REVIEW_COUNT) {
        reviews = tmdbResult.value;
      } else {
        reviews = toReviewObjects(getMockReviewsByGenre(movie.Genre, 6));
      }
    } catch {
      reviews = toReviewObjects(getMockReviewsByGenre(movie.Genre, 6));
    }

    const sanitizedReviews = trimReviewPayload(reviews);
    
    const aiStart = telemetry.startTimer();
    const aiResult = await analyzeAudienceSentiment(movie, sanitizedReviews);
    const aiDuration = telemetry.endTimer(aiStart);

    const sentiment = {
      ...aiResult,
      reviews: sanitizedReviews,
      cachedAt: new Date().toISOString()
    };

    return { sentiment, aiDuration };
  },
  ["sentiment-by-imdb-id"],
  { revalidate: 86400 }
);

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<SentimentResult | ApiErrorResponse>> {
  const requestStart = telemetry.startTimer();
  const { imdbId } = await context.params;
  const ttfb = telemetry.endTimer(requestStart);

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
    const { sentiment, aiDuration } = await getCachedSentiment(imdbId);
    const totalDuration = telemetry.endTimer(requestStart);
    const cacheHit = totalDuration < 200;
    
    telemetry.logMetrics({
      imdbId,
      ttfb,
      movieApiDuration: 0,
      aiDuration,
      totalDuration,
      cacheHit,
      timestamp: Date.now()
    });

    return NextResponse.json(sentiment, {
      status: 200,
      headers: {
        "Cache-Control": SENTIMENT_CACHE_CONTROL,
        "Server-Timing": `ai;dur=${aiDuration.toFixed(1)}, total;dur=${totalDuration.toFixed(1)}`,
        "X-Cache": cacheHit ? "HIT" : "MISS"
      }
    });
  } catch (error: unknown) {
    const totalDuration = telemetry.endTimer(requestStart);
    console.error("[app/api/sentiment/[imdbId]/route.ts][GET]", error);

    if (isOmdbClientError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode
        },
        {
          status: error.statusCode,
          headers: { "Server-Timing": `total;dur=${totalDuration.toFixed(1)}` }
        }
      );
    }

    if (isAIClientError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode
        },
        {
          status: error.statusCode,
          headers: { "Server-Timing": `total;dur=${totalDuration.toFixed(1)}` }
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "AI sentiment service is temporarily unavailable. Please retry in a few moments.",
        statusCode: 503
      },
      {
        status: 503,
        headers: { "Server-Timing": `total;dur=${totalDuration.toFixed(1)}` }
      }
    );
  }
}
