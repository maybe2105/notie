import React, { useState, useRef, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
import { Note } from "../../types/Note";
import styles from "./NoteList.module.css";
import { getPreviewContent } from "../../utils/note.utils";
import DeleteNoteDialog from "../../pages/Home/components/DeleteNoteDialog";
import NoteGrid from "./NoteGrid";

const NoteList: React.FC = () => {
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { hasMore, loadMoreNotes, isLoading, notes } = useNotes();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [columnCount, setColumnCount] = useState(2);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });

        // Determine number of columns based on container width
        if (width < 480) {
          setColumnCount(1);
        } else if (width < 768) {
          setColumnCount(2);
        } else {
          setColumnCount(3);
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

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
    <div className={styles.noteListContainer} ref={containerRef}>
      {dimensions.width > 0 && notes.length > 0 ? (
        <NoteGrid
          notes={notes}
          dimensions={dimensions}
          columnCount={columnCount}
          hasMore={hasMore}
          isLoading={isLoading}
          loadMoreNotes={loadMoreNotes}
          openDeleteDialog={openDeleteDialog}
        />
      ) : notes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No notes yet. Start creating!</p>
        </div>
      ) : null}

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
