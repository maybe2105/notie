import { Route, Switch } from "wouter";
import Home from "./components/Home";
import Note from "./components/Note/Note";
import Navigator from "./components/Navigator";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.appContainer}>
      <Navigator />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/:id" component={Note} />
      </Switch>
    </div>
  );
}

export default App;
