import * as React from 'react';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from '~/pages/Home';
import View from '~/pages/View';

export default () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/r/:id" component={View} />
    </Switch>
  </Router>
);
