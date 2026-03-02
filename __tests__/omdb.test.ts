import { fetchMovie, OmdbClientError } from "@/lib/omdb";

const VALID_IMDB_ID = "tt0133093";

function createMockResponse(payload: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => payload
  } as Response;
}

describe("fetchMovie", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OMDB_API_KEY: "test-omdb-key"
    };

    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  it("fetchMovie returns correct shape for valid ID", async () => {
    const payload = {
      imdbID: VALID_IMDB_ID,
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
      Ratings: [
        { Source: "Internet Movie Database", Value: "8.7/10" },
        { Source: "Rotten Tomatoes", Value: "83%" }
      ],
      imdbRating: "8.7",
      Response: "True"
    };

    const mockedFetch = global.fetch as unknown as jest.Mock;
    mockedFetch.mockResolvedValue(createMockResponse(payload));

    const result = await fetchMovie(VALID_IMDB_ID);

    expect(result.imdbID).toBe(VALID_IMDB_ID);
    expect(result.Title).toBe("The Matrix");
    expect(result.Ratings).toHaveLength(2);
    expect(result.Response).toBe("True");
  });

  it("fetchMovie throws for invalid ID format", async () => {
    await expect(fetchMovie("invalid-id")).rejects.toBeInstanceOf(OmdbClientError);
    await expect(fetchMovie("invalid-id")).rejects.toThrow(
      "Invalid IMDb ID format 'invalid-id'. Expected format tt1234567 or tt12345678."
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetchMovie handles OMDB Movie not found response", async () => {
    const mockedFetch = global.fetch as unknown as jest.Mock;
    mockedFetch.mockResolvedValue(
      createMockResponse({
        Response: "False",
        Error: "Movie not found!"
      })
    );

    await expect(fetchMovie("tt9999999")).rejects.toThrow(
      "Movie 'tt9999999' not found in OMDB database. Please verify the IMDb ID and try again."
    );
  });
});
