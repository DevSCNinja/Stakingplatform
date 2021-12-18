import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Home } from './pages/Home';

function App() {
  return (
    <Router>
      <Switch>
        <Route component={Home} path="/" />
      </Switch>
    </Router>
  );
}

export default App;
