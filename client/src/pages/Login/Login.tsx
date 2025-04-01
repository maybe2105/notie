import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const [inputUsername, setInputUsername] = useState("");
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(inputUsername);
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h2>Welcome to Notie!</h2>
        <p>Please enter your username to continue.</p>
        <input
          type="text"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          placeholder="Username"
          required
          className={styles.loginInput}
        />
        <button type="submit" className={styles.loginButton}>
          Enter
        </button>
      </form>
    </div>
  );
};

export default Login;
