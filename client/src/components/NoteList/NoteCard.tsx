import React from "react";
import { Link } from "wouter";
import { Note } from "../../types/Note";
import styles from "./NoteList.module.css";
import { formatDate, getPreviewContent } from "../../utils/note.utils";

interface NoteCardProps {
  note: Note;
  openDeleteDialog: (e: React.MouseEvent, note: Note) => void;
  style?: React.CSSProperties;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  openDeleteDialog,
  style,
}) => {
  return (
    <div style={style} className={styles.noteWrapper}>
      <Link href={`/note/${note.id}`} className={styles.noteLink}>
        <article className={styles.noteCard}>
          <div className={styles.noteHeader}>
            <span className={styles.noteId}>#{note.id}</span>
          </div>
          <div className={styles.noteContent}>
            <p className={styles.preview}>{getPreviewContent(note.content)}</p>
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
    </div>
  );
};

export default NoteCard;
