import React from "react";
import { Link, useRoute } from "wouter";
import styles from "./Navigator.module.css";
import { useAuth } from "../../context/AuthContext";

const Navigator: React.FC = () => {
  const [matchNote, params] = useRoute("/note/:id");

  const { username, logout } = useAuth();
  return (
    <nav className={styles.navigator}>
      <div className={styles.breadcrumbs}>
        <Link href="/" className={styles.link}>
          Notes
        </Link>
        {matchNote && params?.id && (
          <>
            <span className={styles.separator}>&gt;</span>
            <span className={styles.currentPage}>{params.id}</span>
          </>
        )}
      </div>
      <div className={styles.userSection}>
        <span className={styles.username}>
          Username: <b>{username}</b>
        </span>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigator;
