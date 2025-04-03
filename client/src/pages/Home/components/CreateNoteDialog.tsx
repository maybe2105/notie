import React, { useState } from "react";
import Dialog from "../../../components/Dialog/Dialog";
import { useNotes } from "../../../context/NotesContext";
import { useLocation } from "wouter";
import styles from "./CreateNoteDialog.module.css";
interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateNoteDialog: React.FC<CreateNoteDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createNote } = useNotes();
  const [, setLocation] = useLocation();

  const handleCreateNote = async () => {
    if (!content.trim()) return;

    try {
      setIsCreating(true);
      const newNote = await createNote(content);
      onClose();

      // Navigate to the new note
      if (newNote?.id) {
        setLocation(`/note/${newNote.id}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setContent("");
    onClose();
  };

  return (
    <Dialog
      title="Create New Note"
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleCreateNote}
      confirmLabel={isCreating ? "Creating..." : "Create"}
      confirmDisabled={!content.trim() || isCreating}
    >
      <div className={styles.inputGroup}>
        <label htmlFor="note-content" className={styles.inputLabel}>
          Note Content
        </label>
        <div className={styles.textInputContainer}>
          <textarea
            id="note-content"
            className={styles.textInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note content"
            autoFocus
          />
        </div>
      </div>
      <p>Creating a new simple note, you can edit it later.</p>
    </Dialog>
  );
};

export default CreateNoteDialog;
