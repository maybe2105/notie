import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Note } from "../types/Note";
import { useAuth } from "./AuthContext";
import { getNotes } from "../fetchers/note.fetcher";

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  refreshNotes: () => Promise<void>;
  addnewNote: (note: Note) => Promise<void>;
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
  const removeNote = async (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const updateNote = async (id: string, note: Note) => {
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === id ? note : n)));
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
