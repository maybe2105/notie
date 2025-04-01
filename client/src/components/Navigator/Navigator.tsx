import React from "react";
import { Link, useRoute } from "wouter";
import styles from "./Navigator.module.css";

const Navigator: React.FC = () => {
  const [match, params] = useRoute("/:id");

  return (
    <nav className={styles.navigator}>
      <Link href="/" className={styles.link}>
        Notes
      </Link>
      {match && params?.id && (
        <>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.currentPage}>Id: {params.id}</span>
        </>
      )}
    </nav>
  );
};

export default Navigator;
