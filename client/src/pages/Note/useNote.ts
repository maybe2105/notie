import { useEffect } from "react";
import { useState } from "react";
import { Note } from "../../types/Note";
import { getNote } from "../../fetchers/note.fetcher";

import ShareDB from "sharedb/lib/client";
import ReconnectingWebSocket from "reconnecting-websocket";

export const useNote = (id: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);

  const updateNote = async (note: Note) => {
    if (!socket) return;
    socket.send(JSON.stringify(note));
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const note = await getNote(id);
        setNote(note);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();

    const socket = new ReconnectingWebSocket(
      "ws://localhost:3001/notes/" + id,
      [],
      {
        maxEnqueuedMessages: 0,
      }
    );

    setSocket(socket);

    const connection = new ShareDB.Connection(socket);

    const doc = connection.get("notes", id);

    // log on connection
    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    doc.subscribe((error) => {
      if (error) return console.error(error);

      // If doc.type is undefined, the document has not been created, so let's create it
      if (!doc.type) {
        doc.create({ counter: 0 }, (error) => {
          if (error) console.error(error);
        });
      }
    });

    doc.on("op", (op) => {
      console.log("op", op);
    });

    return () => {
      connection.close();
    };
  }, [id]);

  return { note, isLoading, error, updateNote };
};
