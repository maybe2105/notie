import { useEffect, useState, useCallback } from "react";
import { Note } from "../../../types/Note";
import { useAuth } from "../../../context/AuthContext";
import { usePresence } from "./usePresence";
import { ShareDBError, useShareDbConnection } from "./useShareDBConnection";
import { NoteOperation } from "./useShareDBConnection";

export const useNote = (id: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastOperation, setLastOperation] = useState<NoteOperation[] | null>(
    null
  );
  const { username } = useAuth();

  const [error, setError] = useState<string | null>(null);

  const { docRef } = useShareDbConnection(id, setError);
  const { activeUsers } = usePresence(id, username);

  useEffect(() => {
    if (!docRef.current) return;

    let isMounted = true;
    const doc = docRef.current;

    // Handle the ShareDB callback with proper type handling
    doc.subscribe((err) => {
      if (err) {
        console.error("ShareDB subscription error:", err);
        if (isMounted) {
          setError("Failed to subscribe to document changes");
        }
        return;
      }

      if (doc.type && isMounted) {
        const mappedNote = {
          id: doc.id,
          username: doc.data.username,
          content: doc.data.content,
          createdAt: doc.data.created_at,
          updatedAt: doc.data.updated_at,
          updatedBy: doc.data.updated_by,
        };
        setNote(mappedNote);
        setIsLoading(false);
        console.log("Received initial note data via ShareDB");
      }
      console.log("Subscribed to ShareDB document:", doc.id);
    });

    // Listen for changes (operations) on the document
    doc.on("op", (op: Array<NoteOperation>, source: boolean) => {
      const mockOp = op.find((opItem) => opItem.p[0] === "mock");
      if (mockOp) {
        mockOp.p = ["content"];
        setLastOperation([mockOp]);
      }

      if (!source && isMounted) {
        const lastContentOp = op.find((opItem) => opItem.p[0] === "content");
        if (lastContentOp) {
          setLastOperation([lastContentOp]);
        }
      }

      const newNoteData: Partial<Note> = {};

      op.forEach((opItem) => {
        if (opItem.p && opItem.p.length > 0) {
          const field = opItem.p[0];
          if (field === "updated_at" && opItem.oi !== undefined) {
            newNoteData.updatedAt = opItem.oi as string;
          } else if (field === "content" && opItem.oi !== undefined) {
            newNoteData.content = opItem.oi as string;
          }
        }
      });

      if (Object.keys(newNoteData).length > 0) {
        setNote((prev) => (prev ? { ...prev, ...newNoteData } : prev));
      }
    });

    // Handle errors from the document
    doc.on("error", (error) => {
      console.error("ShareDB document error:", error);
      if (isMounted) {
        // Convert unknown error type to a type with message property
        const errWithMessage = error as unknown as ShareDBError;
        setError("Document error: " + errWithMessage.message);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [docRef]);

  const submitOp = useCallback(
    (op: NoteOperation[]) => {
      if (!docRef.current) return;

      const contentOp = op.find((item) => item.p[0] === "content");
      if (contentOp && contentOp.oi === contentOp.od) {
        return; // No need to submit if content didn't change
      }

      // Handle the callback properly
      docRef.current.submitOp(op, undefined, (err) => {
        if (err) {
          console.error("Error submitting op:", err);
          // Convert unknown error type to a type with message property
          const errWithMessage = err as unknown as ShareDBError;
          setError("Failed to submit changes: " + errWithMessage.message);
        }
      });
    },
    [docRef]
  );

  const clearOperations = useCallback(() => {
    setLastOperation(null);
  }, []);

  return {
    note,
    isLoading,
    error,
    submitOp,
    activeUsers,
    lastOperation,
    clearOperations,
  };
};
