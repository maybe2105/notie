import React, { useState } from "react";
import { Link } from "wouter";
import { Note } from "../../types/Note";
import styles from "./NoteList.module.css";
import { formatDate, getPreviewContent } from "../../utils/note.utils";
import DeleteNoteDialog from "../../pages/Home/components/DeleteNoteDialog";

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openDeleteDialog = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  return (
    <div className={styles.noteListContainer}>
      {notes.map((note) => (
        <Link
          key={note.id}
          href={`/note/${note.id}`}
          className={styles.noteLink}
        >
          <article className={styles.noteCard}>
            <div className={styles.noteContent}>
              <p className={styles.preview}>
                {getPreviewContent(note.content)}
              </p>
            </div>
            <div className={styles.noteFooter}>
              <span className={styles.date}>
                Last updated: {formatDate(note.updatedAt)}
              </span>
              <button
                className={styles.deleteButton}
                onClick={(e) => openDeleteDialog(e, note)}
                aria-label="Delete note"
              >
                <span className={styles.deleteIcon}>Delete</span>
              </button>
            </div>
          </article>
        </Link>
      ))}
      {notes.length === 0 && (
        <div className={styles.emptyState}>
          <p>No notes yet. Start creating!</p>
        </div>
      )}

      {noteToDelete && (
        <DeleteNoteDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          noteId={noteToDelete.id}
          notePreview={getPreviewContent(noteToDelete.content)}
        />
      )}
    </div>
  );
};

export default NoteList;
