import { Route, Switch, Redirect } from "wouter";
import Home from "./pages/Home";
import Note from "./pages/Note";
import Navigator from "./components/Navigator";
import styles from "./App.module.css";
import { useAuth } from "./context/AuthContext";
import { NotesProvider } from "./context/NotesContext";
import Login from "./pages/Login";
import "./index.css";

function AppContent() {
  return (
    <NotesProvider>
      <div className={styles.appContainer}>
        <Navigator />
        <div className={styles.mainContent}>
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path="/note/:id" component={Note} />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </div>
      </div>
    </NotesProvider>
  );
}

function App() {
  const { username } = useAuth();

  return <>{username ? <AppContent /> : <Login />}</>;
}

export default App;
