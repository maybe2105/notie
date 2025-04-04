import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RichTextEditor from "../index";

describe("RichTextEditor", () => {
  it("renders without crashing", () => {
    render(<RichTextEditor />);

    // Check if the editor placeholder is in the document
    expect(screen.getByText("Start typing...")).toBeInTheDocument();

    // Verify toolbar buttons are rendered
    expect(screen.getByTitle("Bold")).toBeInTheDocument();
    expect(screen.getByTitle("Italic")).toBeInTheDocument();
    expect(screen.getByTitle("Underline")).toBeInTheDocument();
  });

  it("renders with initial content", async () => {
    render(<RichTextEditor initialContent="Initial content" />);
    await waitFor(() => {
      // Check that content is displayed
      expect(screen.getByText("Initial content")).toBeInTheDocument();
    });
  });
});
