import { useParams } from "wouter";
import { useNote } from "./hooks/useNote";
import styles from "./Note.module.css";
import RichTextEditor from "../../components/RichTextEditor";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from "react";
import { Note as NoteType } from "../../types/Note";
import { NoteOperation } from "./hooks/useShareDBConnection";
import { useAutoTyping } from "./hooks/useAutoBot";
import { ErrorState } from "./components/Misc";
import { LoadingState } from "./components/Misc";
import NoteHeader from "./components/NoteHeader";

interface EditorProps {
  note: NoteType;
  onContentChange: (content: string) => void;
  lastOperation: NoteOperation[] | null;
  clearOperations: () => void;
}

const Editor = ({
  note,
  onContentChange,
  lastOperation,
  clearOperations,
}: EditorProps) => (
  <div className={styles.editorWrapper}>
    <RichTextEditor
      initialContent={note.content}
      onChange={onContentChange}
      remoteOperations={lastOperation}
      clearOperations={clearOperations}
    />
  </div>
);

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

  useAutoTyping(username, note, submitOp);

  // Content change handler
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (note && username) {
        const now = new Date().toISOString();
        const op: NoteOperation[] = [
          { p: ["content"], od: note.content, oi: newContent },
          { p: ["updated_by"], od: note.updatedBy, oi: username },
          { p: ["updated_at"], od: note.updatedAt, oi: now },
        ];
        submitOp(op);
      }
    },
    [note, username, submitOp]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!note) {
    return <ErrorState error="Note not found" />;
  }

  return (
    <div className={styles.noteContainer}>
      <NoteHeader id={id!} note={note} activeUsers={activeUsers} />
      <Editor
        note={note}
        onContentChange={handleContentChange}
        lastOperation={lastOperation}
        clearOperations={clearOperations}
      />
    </div>
  );
};

export default Note;
