import NoteList from "../../components/NoteList";
import { useNotes } from "../../context/NotesContext";

const Home = () => {
  const { notes } = useNotes();

  return (
    <div>
      <NoteList notes={notes} />
    </div>
  );
};

export default Home;
