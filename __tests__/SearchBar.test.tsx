import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { SearchBar } from "@/components/SearchBar";

describe("SearchBar", () => {
  it("renders input and button", () => {
    const mockSubmit = jest.fn();
    render(<SearchBar onSubmit={mockSubmit} />);

    expect(screen.getByPlaceholderText(/Enter IMDb ID/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Analyze Movie/i })).toBeInTheDocument();
  });

  it("validates IMDb ID format", async () => {
    const mockSubmit = jest.fn();
    render(<SearchBar onSubmit={mockSubmit} />);

    const input = screen.getByPlaceholderText(/Enter IMDb ID/i);
    const button = screen.getByRole("button", { name: /Analyze Movie/i });

    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/IMDb ID must match format/i)).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with valid IMDb ID", async () => {
    const mockSubmit = jest.fn();
    render(<SearchBar onSubmit={mockSubmit} />);

    const input = screen.getByPlaceholderText(/Enter IMDb ID/i);
    const button = screen.getByRole("button", { name: /Analyze Movie/i });

    fireEvent.change(input, { target: { value: "tt0133093" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("tt0133093");
    });
  });

  it("shows loading state when isLoading is true", () => {
    const mockSubmit = jest.fn();
    render(<SearchBar onSubmit={mockSubmit} isLoading={true} />);

    expect(screen.getByText(/Analyzing.../i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("clears error when user types", async () => {
    const mockSubmit = jest.fn();
    render(<SearchBar onSubmit={mockSubmit} />);

    const input = screen.getByPlaceholderText(/Enter IMDb ID/i);
    const button = screen.getByRole("button", { name: /Analyze Movie/i });

    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/IMDb ID must match format/i)).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "tt" } });

    await waitFor(() => {
      expect(screen.queryByText(/IMDb ID must match format/i)).not.toBeInTheDocument();
    });
  });
});
