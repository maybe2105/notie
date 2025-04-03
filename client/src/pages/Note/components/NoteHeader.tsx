import UserAvatars from "./UserAvatars";
import styles from "../Note.module.css";
import { Note as NoteType } from "../../../types/Note";
import { formatDate } from "../../../utils/note.utils";
interface NoteHeaderProps {
  id: string;
  note: NoteType;
  activeUsers: string[];
}

const NoteHeader = ({ id, note, activeUsers }: NoteHeaderProps) => (
  <div className={styles.noteHeader}>
    <div className={styles.noteInfo}>
      <h1 className={styles.noteTitle}>Note #{id}</h1>
      <div className={styles.noteMetadata}>
        <span className={styles.username}>Created by: {note.username}</span>
        <span className={styles.lastUpdated}>
          Last updated: {formatDate(note.updatedAt)}
        </span>
      </div>
    </div>
    <div className={styles.headerRight}>
      {activeUsers.length > 0 && (
        <>
          <UserAvatars users={activeUsers} />
          <div className={styles.activeUsers}>
            <div className={styles.usersList}>
              {activeUsers.length === 1
                ? "1 person editing"
                : `${activeUsers.length} people editing`}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

export default NoteHeader;
