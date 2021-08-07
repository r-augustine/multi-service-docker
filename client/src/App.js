import "./App.css";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

function App() {
  return (
    <Router>
      <div className="App">
        <p>Welcome to React</p>
        <header className="">
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <div>
          <Switch>
            <Route exact path="/" component={Fib} />
            <Route exact path="/otherpage" component={OtherPage}></Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
