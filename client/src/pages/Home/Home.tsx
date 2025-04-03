import { useState } from "react";
import NoteList from "../../components/NoteList";
import { useNotes } from "../../context/NotesContext";
import styles from "./Home.module.css";
import CreateNoteDialog from "./components/CreateNoteDialog";
import HomeHeader from "./components/HomeHeader";

const Home = () => {
  const { notes } = useNotes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return (
    <div className={styles.homeContainer}>
      <HomeHeader notes={notes} openDialog={openDialog} />
      <NoteList notes={notes} />
      <CreateNoteDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </div>
  );
};

export default Home;
