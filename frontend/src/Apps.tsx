import * as React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { LocalStorageProvider } from '~/reducer/localStorage';
import Home from '~/pages/Home';
import View from '~/pages/View';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

export default () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <LocalStorageProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/r/:id" component={View} />
        </Switch>
      </Router>
    </LocalStorageProvider>
  </MuiThemeProvider>
);
