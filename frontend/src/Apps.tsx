import * as React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { RawIntlProvider } from 'react-intl';
import CssBaseline from '@material-ui/core/CssBaseline';
import { LocalStorageProvider } from '~/reducer/localStorage';
import { Intl } from '~/languages';
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
      <RawIntlProvider value={Intl}>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/r/:id" component={View} />
          </Switch>
        </Router>
      </RawIntlProvider>
    </LocalStorageProvider>
  </MuiThemeProvider>
);
