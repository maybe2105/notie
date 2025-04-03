import styles from "./Misc.module.css";

const LoadingState = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.loadingSpinner}></div>
    <p>Loading note...</p>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className={styles.errorMessage}>Error: {error}</div>
);

export { ErrorState, LoadingState };
