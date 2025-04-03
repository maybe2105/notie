import { NoteDTO, Note } from "../types/Note";

export const getNotes = async (
  limit: number = 10,
  offset: number = 0
): Promise<{ notes: Note[]; total: number }> => {
  const response = await fetch(`/api/notes?limit=${limit}&offset=${offset}`);
  const data = await response.json();

  const notes = data.notes.map((note: NoteDTO) => {
    return {
      id: note.id,
      username: note.username,
      content: note.content,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      updatedBy: note.updated_by,
    };
  });

  return {
    notes,
    total: data.total,
  };
};

export const getNote = async (id: string): Promise<Note> => {
  const response = await fetch(`/api/notes/${id}`);
  const data = await response.json();

  const note = {
    id: data.id,
    username: data.username,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  };

  return note;
};

export const createNote = async (
  username: string,
  content: string = ""
): Promise<Note> => {
  const response = await fetch(`/api/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      content,
    }),
  });

  const data = await response.json();

  return {
    id: data.id,
    username: data.username,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  };
};

export const updateNote = async (id: string, note: Note): Promise<Note> => {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: note.username,
      content: note.content,
      updatedBy: note.updatedBy,
    }),
  });

  const data = await response.json();

  return {
    id: data.id,
    username: data.username,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  };
};

export const deleteNote = async (id: string): Promise<void> => {
  await fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
