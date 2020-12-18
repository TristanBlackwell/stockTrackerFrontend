
import React, { Component } from "react";
import './App.css';
import Tickers from "./components/Tickers";

class App extends Component {

  render() {
    return (
      <div className="App">
        <div id="titleContainer">
          <h1 id="title">Stock Tracker</h1>
        </div>
        <Tickers />
      </div>
    );
  }
}

export default App;
