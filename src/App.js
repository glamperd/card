import React from "react";
import "./App.css";
import { setWallet } from "./utils/actions.js";
import { createStore } from "redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./components/Home"

export const store = createStore(setWallet, null);

class App extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path="/" component={Home} />
      </Router>
    );
  }
}

export default App;
