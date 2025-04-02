import { useEffect, useState, useRef } from "react";
import { Note } from "../../types/Note";
import { useAuth } from "../../context/AuthContext";

import ShareDB from "sharedb/lib/client";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Doc } from "sharedb/lib/client";

export const useNote = (id: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
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
      } else if (!doc.type) {
        // Document doesn't exist yet
        doc.create(
          {
            content: "",
            username: username,
            updatedBy: username,
            updatedAt: new Date().toISOString(),
          },
          (error) => {
            if (error) {
              console.error(error);
              if (isMounted) {
                setError("Failed to create document");
              }
            } else {
              if (isMounted) {
                setNote(doc.data as Note);
                setIsLoading(false);
              }
            }
          }
        );
      }

      console.log("Subscribed to ShareDB document:", doc.id);
    });

    // Listen for changes (operations) on the document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.on("op", (op: any, source: boolean) => {
      if (!source && isMounted) {
        const oldContent = op[0].od;
        const newContent = op[0].oi;

        if (oldContent !== newContent) {
          setNote((prev: Note | null) => {
            return {
              ...prev,
              content: newContent,
            };
          });
        }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      docRef.current.submitOp(op, undefined, (err?: any) => {
        if (err) {
          console.error("Error submitting op:", err);
          setError("Failed to submit changes: " + err.message);
        }
      });
    }
  };

  return { note, isLoading, error, submitOp, activeUsers };
};
