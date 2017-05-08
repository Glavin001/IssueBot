// Dependencies
const config = require('config');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const async = require('async');
const express = require('express');
const GitHubOAuth = require('github-oauth');
const socketHandlers = require('./api');
const {sequelize, Repository, Issue} = require("./models");
const createHandler = require('github-webhook-handler');
const webhookHandler = createHandler({ path: '/webhook', secret: config.get('github.webhook_secret') });

sequelize.sync({
  // force: true
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

  app.post('/webhook', (req, res) => {
    // console.log('Webhook received!');
    webhookHandler(req, res, (err) => {
      console.log('Webhook error:', err);
      res.statusCode = 404;
      res.end('no such location');
    });
  });

  githubOAuth.on('error', function(err) {
    console.log('GitHub Login error: ', err);
  });

  githubOAuth.on('token', function(token, res) {
    console.log('here is your shiny new github oauth token', token);
    let access_token = token.access_token;
    // res.end(JSON.stringify(token));
    res.redirect(`${config.get('app.base_url')}/#/setup?access_token=${access_token}`);
  });

  io.on('connection', (socket) => {
    return socketHandlers(socket, io);
  });

  webhookHandler.on('issues', (event) => {
    Issue.webhook(event);
  });

  server.listen(config.get('server.port'), function() {
    console.log(`App listening on port ${config.get('server.port')}!`);
  });

});