import { Route, Switch } from "wouter";
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
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

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
              <NotFound />
            </Route>
          </div>
        </div>
      </Switch>
    </NotesProvider>
  );
}

function App() {
  const { username } = useAuth();

  return (
    <>
      <ToastContainer position="top-center" />
      {username ? <AppContent /> : <Login />}
    </>
  );
}

export default App;
