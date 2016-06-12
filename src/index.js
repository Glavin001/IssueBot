// Dependencies
const config = require('config');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const async = require('async');
const express = require('express');
const GitHubOAuth = require('github-oauth');
const socketHandlers = require('./api');
const {sequelize} = require("./models");

sequelize.sync({
  force: true
}).then(() => {

  const app = express();
  const server = require('http').Server(app);
  const io = require('socket.io')(server);

  // Setup client(s)
  const githubOAuth = GitHubOAuth({
    githubClient: config.get('github.client_id'),
    githubSecret: config.get('github.client_secret'),
    baseURL: `${config.get('server.base_url')}`,
    loginURI: '/github/login',
    callbackURI: '/github/callback',
    scope: 'user write:repo_hook repo' // optional, default scope is set to user
  })

  // Static: http://expressjs.com/en/starter/static-files.html
  app.use(express.static('public/dist'));

  app.get('/', function(req, res) {
    res.sendfile('index.html');
  });

  app.get('/github/login', function(req, res) {
    return githubOAuth.login(req, res);
  });

  app.get('/github/callback', function(req, res) {
    return githubOAuth.callback(req, res);
  });

  githubOAuth.on('error', function(err) {
    console.error('there was a login error', err);
  });

  githubOAuth.on('token', function(token, res) {
    console.log('here is your shiny new github oauth token', token);
    let access_token = token.access_token;
    // res.end(JSON.stringify(token));
    res.redirect(`/#/setup?access_token=${access_token}`);
  });

  io.on('connection', (socket) => {
    return socketHandlers(socket, io);
  });

  server.listen(config.get('server.port'), function() {
    console.log(`App listening on port ${config.get('server.port')}!`);
  });

});