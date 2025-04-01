import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Note from "./pages/Note";
import Navigator from "./components/Navigator";
import styles from "./App.module.css";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import "./index.css";

function AppContent() {
  return (
    <div className={styles.appContainer}>
      <Navigator />
      <div className={styles.mainContent}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/:id" component={Note} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  const { username } = useAuth();

  return <>{username ? <AppContent /> : <Login />}</>;
}

export default App;
