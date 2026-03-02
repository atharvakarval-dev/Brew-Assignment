import React from "react";
import { render, screen } from "@testing-library/react";

import { MovieCard } from "@/components/MovieCard";

const mockMovie = {
  imdbID: "tt0133093",
  Title: "The Matrix",
  Year: "1999",
  Rated: "R",
  Released: "31 Mar 1999",
  Runtime: "136 min",
  Genre: "Action, Sci-Fi",
  Director: "Lana Wachowski, Lilly Wachowski",
  Writer: "Lilly Wachowski, Lana Wachowski",
  Actors: "Keanu Reeves, Laurence Fishburne",
  Plot: "A hacker discovers reality.",
  Poster: "https://example.com/poster.jpg",
  Ratings: [{ Source: "Rotten Tomatoes", Value: "83%" }],
  imdbRating: "8.7",
  Response: "True" as const
};

describe("MovieCard", () => {
  it("renders movie title and ratings", () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText(/IMDb 8.7/i)).toBeInTheDocument();
    expect(screen.getByText(/RT 83%/i)).toBeInTheDocument();
  });

  it("displays year and runtime", () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("136 min")).toBeInTheDocument();
  });

  it("shows genre tags", () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
  });

  it("displays director and writer", () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText(/Lana Wachowski, Lilly Wachowski/i)).toBeInTheDocument();
  });
});
