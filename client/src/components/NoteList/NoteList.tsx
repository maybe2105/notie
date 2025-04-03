import React from "react";
import { Link } from "wouter";
import { Note } from "../../types/Note";
import styles from "./NoteList.module.css";
import { formatDate, getPreviewContent } from "../../utils/note.utils";

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
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
            </div>
          </article>
        </Link>
      ))}
      {notes.length === 0 && (
        <div className={styles.emptyState}>
          <p>No notes yet. Start creating!</p>
        </div>
      )}
    </div>
  );
};

export default NoteList;
