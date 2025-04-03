import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Note } from "../types/Note";
import { useAuth } from "./AuthContext";
import {
  getNotes,
  updateNote as updateNoteAPI,
  createNote as createNoteAPI,
} from "../fetchers/note.fetcher";

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  refreshNotes: () => Promise<void>;
  addnewNote: (note: Note) => Promise<void>;
  createNote: (content?: string) => Promise<Note>;
  removeNote: (id: string) => Promise<void>;
  updateNote: (id: string, note: Note) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();

  const refreshNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const addnewNote = async (note: Note) => {
    setNotes((prevNotes) => [note, ...prevNotes]);
  };

  const createNote = async (content: string = ""): Promise<Note> => {
    try {
      if (!username) {
        throw new Error("User not authenticated");
      }
      const newNote = await createNoteAPI(username, content);
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
      throw err;
    }
  };

  const removeNote = async (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const updateNote = async (id: string, note: Note) => {
    try {
      const updatedNote = await updateNoteAPI(id, note);
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === id ? updatedNote : n))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  useEffect(() => {
    if (username) {
      refreshNotes();
    }
  }, [username]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        error,
        refreshNotes,
        addnewNote,
        createNote,
        removeNote,
        updateNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
