import { useState } from "react";
import { useParams } from "wouter";
import { useNote } from "./useNote";
import styles from "./Note.module.css";
import RichTextEditor from "../../components/RichTextEditor";
import { useAuth } from "../../context/AuthContext";

const Note = () => {
  const { id } = useParams();
  const { note, isLoading, error, submitOp } = useNote(id!);
  const { username } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleContentChange = (newContent: string) => {
    if (note && username) {
      const op = [
        { p: ["content"], od: note.content, oi: newContent },
        { p: ["updatedBy"], od: note.updatedBy, oi: username },
      ];
      submitOp(op);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading note...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>Error: {error}</div>;
  }

  if (!note) {
    return <div className={styles.errorMessage}>Note not found</div>;
  }

  return (
    <div className={styles.noteContainer}>
      <div className={styles.noteHeader}>
        <div className={styles.noteInfo}>
          <h1 className={styles.noteTitle}>Note #{note.id}</h1>
          <div className={styles.noteMetadata}>
            <span className={styles.username}>Created by: {note.username}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.lastUpdated}>
              Last updated: {formatDate(note.updatedAt)}
            </span>
            <span className={styles.separator}>•</span>
            <span className={styles.updatedBy}>
              Updated by: {note.updatedBy || note.username}
            </span>
          </div>
        </div>
        <button onClick={handleEditToggle} className={styles.editButton}>
          {isEditing ? "View" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <div className={styles.editorWrapper}>
          <RichTextEditor
            initialContent={note.content}
            onChange={handleContentChange}
          />
        </div>
      ) : (
        <div className={styles.noteContent}>
          {note.content.split("\n").map((line, index) => (
            <p key={index} className={styles.contentLine}>
              {line || <br />}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Note;
