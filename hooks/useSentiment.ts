"use client";

import { useCallback, useEffect, useState } from "react";

import type { ApiErrorResponse, SentimentResult } from "@/lib/types";
import { validateImdbId } from "@/lib/utils";

interface UseSentimentResult {
  sentiment: SentimentResult | null;
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

function isSentimentResult(payload: unknown): payload is SentimentResult {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const value = payload as Record<string, unknown>;
  const sentimentValue = value.sentiment;
  return (
    (sentimentValue === "positive" ||
      sentimentValue === "mixed" ||
      sentimentValue === "negative") &&
    typeof value.score === "number" &&
    typeof value.summary === "string" &&
    Array.isArray(value.insights) &&
    typeof value.cachedAt === "string"
  );
}

export function useSentiment(imdbId: string): UseSentimentResult {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requestNonce, setRequestNonce] = useState<number>(0);

  const retry = useCallback((): void => {
    setRequestNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!validateImdbId(imdbId)) {
      setSentiment(null);
      setIsLoading(false);
      setError(
        `Invalid IMDb ID '${imdbId}'. Use format tt1234567 or tt12345678.`
      );
      return;
    }

    const controller = new AbortController();

    async function loadSentiment(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sentiment/${imdbId}`, {
          method: "GET",
          signal: controller.signal
        });

        const payload = (await response.json()) as unknown;
        if (!response.ok) {
          const message = isApiErrorResponse(payload)
            ? payload.error
            : `Sentiment request failed with status ${response.status}.`;
          throw new Error(message);
        }

        if (!isSentimentResult(payload)) {
          throw new Error("Sentiment API returned an invalid payload shape.");
        }

        setSentiment(payload);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[hooks/useSentiment.ts][loadSentiment]", error);
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load AI sentiment analysis right now.";
        setError(message);
        setSentiment(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadSentiment();

    return () => {
      controller.abort();
    };
  }, [imdbId, requestNonce]);

  return { sentiment, isLoading, error, retry };
}
