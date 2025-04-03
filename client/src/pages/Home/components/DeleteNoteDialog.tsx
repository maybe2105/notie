import React, { useState } from "react";
import Dialog from "../../../components/Dialog/Dialog";
import { useNotes } from "../../../context/NotesContext";
import styles from "./DeleteNoteDialog.module.css";

interface DeleteNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  notePreview: string;
}

const DeleteNoteDialog: React.FC<DeleteNoteDialogProps> = ({
  isOpen,
  onClose,
  noteId,
  notePreview,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeNote } = useNotes();

  const handleDeleteNote = async () => {
    try {
      setIsDeleting(true);
      await removeNote(noteId);
      onClose();
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      title="Delete Note"
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleDeleteNote}
      confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      confirmDisabled={isDeleting}
    >
      <div className={styles.dialogBody}>
        <p className={styles.warningText}>
          This action cannot be undone. Are you sure you want to delete this
          note?
        </p>
        <div className={styles.notePreview}>
          <p>
            "{notePreview.substring(0, 120)}
            {notePreview.length > 120 ? "..." : ""}"
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteNoteDialog;
