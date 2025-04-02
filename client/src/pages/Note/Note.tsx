import { useParams } from "wouter";
import { useNote } from "./useNote";
import styles from "./Note.module.css";
import RichTextEditor from "../../components/RichTextEditor";
import { useAuth } from "../../context/AuthContext";

const Note = () => {
  const { id } = useParams();
  const { note, isLoading, error, submitOp, activeUsers } = useNote(id!);
  const { username } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleContentChange = (newContent: string) => {
    if (note && username) {
      const op = [{ p: ["content"], od: note.content, oi: newContent }];
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
        <div className={styles.headerRight}>
          {activeUsers.length > 0 && (
            <div className={styles.activeUsers}>
              <div className={styles.usersList}>
                Currently editing:{" "}
                {activeUsers.map((user, index) => (
                  <span key={user} className={styles.activeUser}>
                    {user}
                    {index < activeUsers.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.editorWrapper}>
        <RichTextEditor
          initialContent={note.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default Note;
