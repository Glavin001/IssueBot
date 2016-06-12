import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link, hashHistory, IndexRedirect } from 'react-router'

import App from './components/app';
import Welcome from './components/welcome';
import Setup from './components/setup';
import Syncing from './components/syncing';
import NoMatch from './components/no_match';

import 'font-awesome-webpack';
import '../styles/app.scss';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRedirect to="welcome" />
      <Route path="welcome" component={Welcome} />
      <Route path="setup" component={Setup} />
      <Route path="syncing" component={Syncing} />
      <Route path="*" component={NoMatch} />
    </Route>
  </Router>
),
  document.getElementById('root')
);
