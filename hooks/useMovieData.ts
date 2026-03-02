"use client";

import { useCallback, useEffect, useState } from "react";

import type { ApiErrorResponse, MovieData } from "@/lib/types";
import { validateImdbId } from "@/lib/utils";

interface UseMovieDataResult {
  movie: MovieData | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const value = payload as Record<string, unknown>;
  return typeof value.error === "string";
}

function isMovieData(payload: unknown): payload is MovieData {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const value = payload as Record<string, unknown>;
  return (
    typeof value.imdbID === "string" &&
    typeof value.Title === "string" &&
    typeof value.Year === "string" &&
    (value.Response === "True" || value.Response === "False")
  );
}

export function useMovieData(imdbId: string): UseMovieDataResult {
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requestNonce, setRequestNonce] = useState<number>(0);

  const retry = useCallback((): void => {
    setRequestNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!validateImdbId(imdbId)) {
      setMovie(null);
      setIsLoading(false);
      setError(
        `Invalid IMDb ID '${imdbId}'. Use format tt1234567 or tt12345678.`
      );
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function loadMovieData(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/movie/${imdbId}`, {
          method: "GET",
          signal: controller.signal
        });

        const payload = (await response.json()) as unknown;
        if (!response.ok) {
          const message = isApiErrorResponse(payload)
            ? payload.error
            : `Request failed with status ${response.status}.`;
          throw new Error(message);
        }

        if (!isMovieData(payload)) {
          throw new Error("Movie API returned an invalid payload shape.");
        }

        if (isMounted) {
          setMovie(payload);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[hooks/useMovieData.ts][loadMovieData]", error);
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load movie details right now.";
        if (isMounted) {
          setError(message);
          setMovie(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMovieData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [imdbId, requestNonce]);

  return { movie, isLoading, error, retry };
}
