import { renderHook, waitFor } from "@testing-library/react";

import { useMovieData } from "@/hooks/useMovieData";

const mockMovieData = {
  imdbID: "tt0133093",
  Title: "The Matrix",
  Year: "1999",
  Rated: "R",
  Released: "31 Mar 1999",
  Runtime: "136 min",
  Genre: "Action, Sci-Fi",
  Director: "Lana Wachowski, Lilly Wachowski",
  Writer: "Lilly Wachowski, Lana Wachowski",
  Actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
  Plot: "A hacker discovers the world is a simulation.",
  Poster: "https://example.com/poster.jpg",
  Ratings: [],
  imdbRating: "8.7",
  Response: "True" as const
};

describe("useMovieData", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns movie data on successful fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMovieData
    });

    const { result } = renderHook(() => useMovieData("tt0133093"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.movie).toEqual(mockMovieData);
    expect(result.current.error).toBeNull();
  });

  it("handles invalid IMDb ID", async () => {
    const { result } = renderHook(() => useMovieData("invalid"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain("Invalid IMDb ID");
    expect(result.current.movie).toBeNull();
  });

  it("handles API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Movie not found" })
    });

    const { result } = renderHook(() => useMovieData("tt9999999"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Movie not found");
    expect(result.current.movie).toBeNull();
  });
});
