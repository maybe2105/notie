import React from "react";
import styles from "./NoteList.module.css";

interface LoadingCardProps {
  style?: React.CSSProperties;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ style }) => {
  return (
    <div style={style} className={styles.loadingCard}>
      <div className={styles.noteCard}>
        <div className={styles.noteHeader}>
          <span className={styles.noteId}>#loading...</span>
        </div>
        <div className={styles.noteContent}>
          <p className={styles.preview}>Loading...</p>
        </div>
        <div className={styles.noteFooter}>
          <span className={styles.date}>Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;
