import { useParams } from "wouter";
import { useNote } from "./useNote";
import styles from "./Note.module.css";
import RichTextEditor from "../../components/RichTextEditor";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef } from "react";

// Lorem ipsum text to use for auto typing simulation
const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const Note = () => {
  const { id } = useParams<{ id: string }>();
  const {
    note,
    isLoading,
    error,
    submitOp,
    activeUsers,
    lastOperation,
    clearOperations,
  } = useNote(id!);
  const { username } = useAuth();
  const simulationRef = useRef<number | null>(null);
  const charIndexRef = useRef(0);

  // Simulate another user typing
  useEffect(() => {
    // Only activate if the current user is "autobot"
    if (username !== "autobot" || !note) return;

    // Clear any existing simulation
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }

    console.log("Starting autotype simulation");

    // Start a timed simulation of another user typing
    simulationRef.current = window.setInterval(() => {
      if (!note) return;

      // Get the current character from lorem ipsum
      const currentChar = loremIpsum[charIndexRef.current % loremIpsum.length];
      charIndexRef.current += 1;

      // Construct a mock operation as if from another user
      const mockContent = note.content + currentChar;
      const now = new Date().toISOString();
      const mockOp = [
        { p: ["content"], od: note.content, oi: mockContent },
        { p: ["updated_by"], od: note.updatedBy, oi: "SimulatedUser" },
        { p: ["updated_at"], od: note.updatedAt, oi: now },
        { p: ["mock"], od: "", oi: mockContent },
      ];

      // Send this operation to the server
      // We'll mock it directly to the document's operations
      // But set the user different from current
      submitOp(mockOp);
    }, 500); // Type a character every 3 seconds

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, [username, note, submitOp]);

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
      const now = new Date().toISOString();
      const op = [
        { p: ["content"], od: note.content, oi: newContent },
        { p: ["updated_by"], od: note.updatedBy, oi: username },
        { p: ["updated_at"], od: note.updatedAt, oi: now },
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
          <h1 className={styles.noteTitle}>Note #{id}</h1>
          <div className={styles.noteMetadata}>
            <span className={styles.username}>Created by: {note.username}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.lastUpdated}>
              Last updated: {formatDate(note.updatedAt)}
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
          remoteOperations={lastOperation}
          clearOperations={clearOperations}
        />
      </div>
    </div>
  );
};

export default Note;
