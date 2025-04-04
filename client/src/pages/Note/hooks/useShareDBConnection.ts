import { useEffect } from "react";

import { useRef } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Doc } from "sharedb/lib/client";
import ShareDB from "sharedb/lib/client";

export type NoteOperation = {
  p: string[];
  oi?: string | Record<string, unknown>;
  od?: string | Record<string, unknown>;
};

// Type for ShareDB errors
export type ShareDBError = {
  message: string;
  [key: string]: unknown;
};

// Separate hook for ShareDB connection
export const useShareDbConnection = (
  id: string,
  setError: (error: string) => void
) => {
  const docRef = useRef<Doc | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Use relative URL instead of hardcoded localhost
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/notes/${id}`;

    const socket = new ReconnectingWebSocket(wsUrl, [], {
      maxEnqueuedMessages: 0,
    });

    const connection = new ShareDB.Connection(socket as unknown as WebSocket);
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

    return () => {
      isMounted = false;
      console.log("Closing ShareDB connection");
      connection.close();
      docRef.current = null;
    };
  }, [id]);

  return { docRef };
};
