import React from "react";
import { render, screen } from "@testing-library/react";

import { CastList } from "@/components/CastList";

describe("CastList", () => {
  it("renders cast members from CSV string", () => {
    render(<CastList actors="Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss" />);

    expect(screen.getByText("Keanu Reeves")).toBeInTheDocument();
    expect(screen.getByText("Laurence Fishburne")).toBeInTheDocument();
    expect(screen.getByText("Carrie-Anne Moss")).toBeInTheDocument();
  });

  it("displays initials for each actor", () => {
    render(<CastList actors="Keanu Reeves, Tom Hanks" />);

    expect(screen.getByText("KR")).toBeInTheDocument();
    expect(screen.getByText("TH")).toBeInTheDocument();
  });

  it("limits display to 6 actors", () => {
    const actors = "A B, C D, E F, G H, I J, K L, M N, O P";
    const { container } = render(<CastList actors={actors} />);

    const castCards = container.querySelectorAll(".rounded-card");
    expect(castCards).toHaveLength(6);
  });
});
