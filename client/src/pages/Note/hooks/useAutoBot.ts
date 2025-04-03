import { useEffect } from "react";

import { useRef } from "react";
import { NoteOperation } from "./useShareDBConnection";
import { Note } from "../../../types/Note";

const TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

export const useAutoTyping = (
  username: string | null,
  note: Note | null,
  submitOp: (op: NoteOperation[]) => void
) => {
  const simulationRef = useRef<number | null>(null);
  const charIndexRef = useRef(0);

  // Lorem ipsum text for auto typing simulation

  useEffect(() => {
    // Only activate if the current user is "autobot"
    if (username !== "autobot" || !note) return;

    // Clear any existing simulation
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }

    console.log("Starting autotype simulation");

    // Start a timed simulation of another user typing
    simulationRef.current = window.setInterval(() => {
      if (!note) return;

      // Get the current character from lorem ipsum
      const currentChar = TEXT[charIndexRef.current % TEXT.length];
      charIndexRef.current += 1;

      // Construct a mock operation as if from another user
      const mockContent = note.content + currentChar;
      const now = new Date().toISOString();
      const mockOp: NoteOperation[] = [
        { p: ["content"], od: note.content, oi: mockContent },
        { p: ["updated_by"], od: note.updatedBy, oi: "SimulatedUser" },
        { p: ["updated_at"], od: note.updatedAt, oi: now },
        { p: ["mock"], od: "", oi: mockContent },
      ];

      // Send this operation to the server
      submitOp(mockOp);
    }, 500); // Type a character every 500ms

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, [username, note, submitOp]);
};
