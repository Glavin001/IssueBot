// Dependencies
const _ = require('lodash');
const fs = require('fs');

const config = require('config');
const { EVENTS } = require('../constants');
const GitHubApi = require("github");
const GitHubToken = config.get('github.token');

// Setup
const handlers = _.chain(fs.readdirSync(__dirname))
  .filter((file) => {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .map((file) => {
    return require('./'+file);
  }).value();

// Bind event listeners to new sockets
module.exports = function(socket, io) {
  console.log('a user connected');

  /**
  When socket disconnects
  */
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  /**
  Authenticate Socket with GitHub token
  */
  socket.on(EVENTS.AUTHENTICATE, (token, cb) => {
    console.log(EVENTS.AUTHENTICATE, token);
    const github = new GitHubApi({
      debug: false,
    });
    // Create an authenticated GitHub client
    github.authenticate({type: "oauth", token: token});
    // Test the client by attempting to get the user's information
    github.users.get({}, function(err, res) {
      if (err) {
        return cb(err.message);
      }

      // Leave all rooms previously listening to
      // Cite: https://github.com/socketio/socket.io/blob/fb0253edea0798185be803b4fa613bbdd5d4bd9d/lib/socket.js#L277
      // Note: this is a private API
      socket.leaveAll();
      // Join for token
      socket.join(`user:${token}`);
      // Save github client for socket
      socket.token = token;
      socket.github = github;
      // Save User info
      socket.user = res;

      return cb(null, res);
    });
  });

  // Add all other Socket event handlers
  _.each(handlers, (handler) => {
    handler(socket, io);
  });

};
