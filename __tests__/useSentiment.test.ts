import { renderHook, waitFor } from "@testing-library/react";

import { useSentiment } from "@/hooks/useSentiment";

const mockSentimentData = {
  sentiment: "positive" as const,
  score: 88,
  summary: "Audiences praised the film.",
  insights: ["Great visuals", "Strong performances", "Engaging story"],
  cachedAt: "2024-01-01T00:00:00.000Z"
};

describe("useSentiment", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns sentiment data on successful fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSentimentData
    });

    const { result } = renderHook(() => useSentiment("tt0133093"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sentiment).toEqual(mockSentimentData);
    expect(result.current.error).toBeNull();
  });

  it("handles invalid IMDb ID", async () => {
    const { result } = renderHook(() => useSentiment("invalid"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain("Invalid IMDb ID");
    expect(result.current.sentiment).toBeNull();
  });

  it("handles API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: "Service unavailable" })
    });

    const { result } = renderHook(() => useSentiment("tt0133093"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Service unavailable");
    expect(result.current.sentiment).toBeNull();
  });
});
