import { useEffect, useState, useRef, useCallback } from "react";
import { Note } from "../../types/Note";
import { useAuth } from "../../context/AuthContext";

import ShareDB from "sharedb/lib/client";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Doc } from "sharedb/lib/client";

export type NoteOperation = {
  p: string[];
  oi?: string | Record<string, unknown>;
  od?: string | Record<string, unknown>;
};

export const useNote = (id: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [lastOperation, setLastOperation] = useState<NoteOperation[] | null>(
    null
  );
  const docRef = useRef<Doc | null>(null);
  const presenceSocketRef = useRef<WebSocket | null>(null);
  const { username } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const socket = new ReconnectingWebSocket(
      "ws://localhost:3001/notes/" + id,
      [],
      {
        maxEnqueuedMessages: 0,
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = new ShareDB.Connection(socket as any);

    const doc = connection.get("notes", id);
    docRef.current = doc;

    socket.onopen = () => {
      console.log("ShareDB WebSocket connection opened");
    };

    socket.onerror = (event) => {
      console.error("ShareDB WebSocket error:", event);
      if (isMounted) {
        setError("WebSocket connection error");
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.subscribe((err?: any) => {
      if (err) {
        console.error("ShareDB subscription error:", err);
        if (isMounted) {
          setError("Failed to subscribe to document changes");
        }
        return;
      }

      if (doc.type && isMounted) {
        // Document exists, set note from doc data
        setNote(doc.data as Note);
        setIsLoading(false);
        console.log("Received initial note data via ShareDB");
      }
      console.log("Subscribed to ShareDB document:", doc.id);
    });

    // Listen for changes (operations) on the document
    doc.on("op", (op: Array<NoteOperation>, source: boolean) => {
      console.log("🚀 ~ doc.on ~ op:", op, source);

      if (!source && isMounted) {
        const lastContentOp = op.find((opItem) => opItem.p[0] === "content");
        if (lastContentOp) {
          setLastOperation([lastContentOp]);
        }

        // For operations from other users, signal the operation

        // Also update our state model (but don't cause complete re-renders of content)
      }
      const newNoteData: Partial<Note> = {};

      // Find operation by path in the operation array
      op.forEach((opItem) => {
        if (opItem.p && opItem.p.length > 0) {
          const field = opItem.p[0];
          // For non-content fields, update them in our state
          if (field === "updated_at" && opItem.oi !== undefined) {
            newNoteData.updatedAt = opItem.oi as string;
          } else if (field === "content" && opItem.oi !== undefined) {
            newNoteData.content = opItem.oi as string;
          }
          // We'll handle content updates separately in the editor component
        }
      });
      if (Object.keys(newNoteData).length > 0) {
        setNote((prev) => {
          if (!prev) return prev;
          return { ...prev, ...newNoteData };
        });
      }
    });

    // Handle errors from the document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.on("error", (err: any) => {
      console.error("ShareDB document error:", err);
      if (isMounted) {
        setError("Document error: " + err.message);
      }
    });

    return () => {
      isMounted = false;
      console.log("Closing ShareDB connection");
      connection.close();
      docRef.current = null;
    };
  }, [id, username]);

  useEffect(() => {
    let isMounted = true;

    if (!username) return;

    const url = new URL(`ws://localhost:3001/presence/${id}`);
    url.searchParams.append("username", username);

    // Create WebSocket connection for presence
    const presenceSocket = new WebSocket(url.toString());
    presenceSocketRef.current = presenceSocket;

    presenceSocket.onopen = () => {
      console.log("Presence WebSocket connection opened");
    };

    presenceSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "presence" && isMounted) {
          setActiveUsers(data.users);
        }
      } catch (err) {
        console.error("Error parsing presence message:", err);
      }
    };

    presenceSocket.onerror = (event) => {
      console.error("Presence WebSocket error:", event);
    };

    // Clean up the presence connection on unmount
    return () => {
      isMounted = false;
      if (presenceSocketRef.current) {
        presenceSocketRef.current.close();
        presenceSocketRef.current = null;
      }
    };
  }, [id, username]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitOp = (op: any) => {
    if (docRef.current) {
      const contentOp = op.find(
        (item: NoteOperation) => item.p[0] === "content"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (contentOp && contentOp.oi === contentOp.od) {
        // set it locally
        return;
      }
      docRef.current.submitOp(op, undefined, (err?: any) => {
        if (err) {
          console.error("Error submitting op:", err);
          setError("Failed to submit changes: " + err.message);
        }
      });
    }
  };

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
