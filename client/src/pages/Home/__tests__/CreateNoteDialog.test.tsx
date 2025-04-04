import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateNoteDialog from "../components/CreateNoteDialog";

// Mock the dependencies
vi.mock("../../../context/NotesContext", () => ({
  useNotes: () => ({
    createNote: vi.fn(() => Promise.resolve({ id: "test-note-id" })),
  }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
}));

describe("CreateNoteDialog", () => {
  it("renders when open and contains required elements", () => {
    const onCloseMock = vi.fn();

    render(<CreateNoteDialog isOpen={true} onClose={onCloseMock} />);

    // Check dialog title is displayed
    expect(screen.getByText("Create New Note")).toBeInTheDocument();

    // Check form elements exist
    expect(screen.getByLabelText("Note Content")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your note content")
    ).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
