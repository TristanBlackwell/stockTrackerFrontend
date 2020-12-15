
import './App.css';
import Graph from "./components/Graph";
import Tickers from "./components/Tickers";

function App() {

  return (
    <div className="App">
      <div id="titleContainer">
        <h1 id="title">Stock Tracker</h1>
      </div>
      <Graph />
      <Tickers />
    </div>
  );
}

export default App;
