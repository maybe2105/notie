import { Route, Switch, Redirect } from "wouter";
import { ToastContainer } from "react-fox-toast";

import Navigator from "./components/Navigator";
import styles from "./App.module.css";
import { useAuth } from "./context/AuthContext";
import { NotesProvider } from "./context/NotesContext";
import "./index.css";
import { lazy } from "react";

const Home = lazy(() => import("./pages/Home"));
const Note = lazy(() => import("./pages/Note"));
const Login = lazy(() => import("./pages/Login"));

function AppContent() {
  return (
    <NotesProvider>
      <Switch>
        <div className={styles.appContainer}>
          <Navigator />
          <div className={styles.mainContent}>
            <Route path={"/"} component={Home} />
            <Route path="/note/:id" component={Note} />
            <Route>
              <Redirect to="/" />
            </Route>
          </div>
        </div>
      </Switch>
    </NotesProvider>
  );
}

function App() {
  const { username } = useAuth();

  if (!username) {
    return <Login />;
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <AppContent />
    </>
  );
}

export default App;
