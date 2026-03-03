import type { SentimentResult } from "@/lib/types";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

type ReviewItem = NonNullable<SentimentResult["reviews"]>[number];

interface TmdbFindResponse {
  movie_results?: Array<{
    id: number;
  }>;
}

interface TmdbReview {
  author?: string;
  content?: string;
}

interface TmdbReviewsResponse {
  results?: TmdbReview[];
}

export async function getTMDBReviews(imdbId: string): Promise<ReviewItem[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const findResponse = await fetch(
    `${BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
  );

  if (!findResponse.ok) {
    throw new Error(`TMDB API error: ${findResponse.status}`);
  }

  const findData = (await findResponse.json()) as TmdbFindResponse;
  const movie = findData.movie_results?.[0];

  if (!movie) {
    throw new Error("Movie not found");
  }

  const reviewsResponse = await fetch(
    `${BASE_URL}/movie/${movie.id.toString()}/reviews?api_key=${TMDB_API_KEY}`
  );

  if (!reviewsResponse.ok) {
    throw new Error("Failed to fetch reviews");
  }

  const reviewsData = (await reviewsResponse.json()) as TmdbReviewsResponse;
  const results = Array.isArray(reviewsData.results) ? reviewsData.results : [];

  return results
    .filter((review): review is TmdbReview & { content: string } => {
      return typeof review.content === "string" && review.content.length > 50;
    })
    .slice(0, 6)
    .map((review) => {
      const author =
        typeof review.author === "string" && review.author.trim().length > 0
          ? review.author
          : "Anonymous";

      return {
        author,
        content: review.content,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=1a1a1a&color=ffffff&size=64`
      };
    });
}
