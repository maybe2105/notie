import { useEffect, useState } from "react";
import NoteList from "../../components/NoteList";
import { useNotes } from "../../context/NotesContext";
import styles from "./Home.module.css";
import CreateNoteDialog from "./components/CreateNoteDialog";
import HomeHeader from "./components/HomeHeader";

const Home = () => {
  const { total, refreshNotes } = useNotes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  useEffect(() => {
    refreshNotes();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <HomeHeader total={total} openDialog={openDialog} />
      <div className={styles.noteListWrapper}>
        <NoteList />
      </div>
      <CreateNoteDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </div>
  );
};

export default Home;
