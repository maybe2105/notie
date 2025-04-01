import { useEffect } from "react";
import { useState } from "react";
import { Note } from "../../types/Note";
import { getNote } from "../../fetchers/note.fetcher";

export const useNote = (id: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateNote = async (note: Note) => {};

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
  }, [id]);

  return { note, isLoading, error, updateNote };
};
