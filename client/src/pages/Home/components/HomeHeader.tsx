import { Note } from "../../../types/Note";
import styles from "../Home.module.css";

export default function HomeHeader({
  notes,
  openDialog,
}: {
  notes: Note[];
  openDialog: () => void;
}) {
  return (
    <header className={styles.homeHeader}>
      <div className={styles.headerLeft}>
        <h1>Notie</h1>
        <p className={styles.subheading}>
          You have {notes.length} {notes.length !== 1 ? "notes" : "note"}
        </p>
      </div>
      <button className={styles.createButton} onClick={openDialog}>
        <span className={styles.createIcon}>+</span>
        <span>New Note</span>
      </button>
    </header>
  );
}
