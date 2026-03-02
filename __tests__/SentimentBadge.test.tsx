import React from "react";
import { render, screen } from "@testing-library/react";

import { SentimentBadge } from "@/components/SentimentBadge";

describe("SentimentBadge", () => {
  it("renders positive sentiment", () => {
    render(<SentimentBadge sentiment="positive" />);
    expect(screen.getByText("POSITIVE")).toBeInTheDocument();
  });

  it("renders mixed sentiment", () => {
    render(<SentimentBadge sentiment="mixed" />);
    expect(screen.getByText("MIXED")).toBeInTheDocument();
  });

  it("renders negative sentiment", () => {
    render(<SentimentBadge sentiment="negative" />);
    expect(screen.getByText("NEGATIVE")).toBeInTheDocument();
  });

  it("applies correct styling for positive", () => {
    const { container } = render(<SentimentBadge sentiment="positive" />);
    const badge = container.querySelector(".text-cinematic-positive");
    expect(badge).toBeInTheDocument();
  });

  it("applies correct styling for negative", () => {
    const { container } = render(<SentimentBadge sentiment="negative" />);
    const badge = container.querySelector(".text-cinematic-negative");
    expect(badge).toBeInTheDocument();
  });
});
