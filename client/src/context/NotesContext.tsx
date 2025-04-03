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
  createNote as createNoteAPI,
  deleteNote as deleteNoteAPI,
} from "../fetchers/note.fetcher";
import { toast } from "react-fox-toast";

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  total: number;
  refreshNotes: () => Promise<void>;
  addnewNote: (note: Note) => Promise<void>;
  createNote: (content?: string) => Promise<Note>;
  removeNote: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();

  const refreshNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNotes();
      setNotes(data.notes);
      setTotal(data.total);
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
      toast.success(`Note created successfully`);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
      throw err;
    }
  };

  const removeNote = async (id: string) => {
    try {
      await deleteNoteAPI(id);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      toast.success(`Note ${id} deleted successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
      throw err;
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
        total,
        removeNote,
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
