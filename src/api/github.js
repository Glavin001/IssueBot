const config = require('config');
const { EVENTS, ERRORS } = require('../constants');
const GitHubApi = require("github");
const _ = require('lodash');

module.exports = function(socket) {
  /**
  Get user information
  */
  socket.on(EVENTS.GITHUB_USER, (options, cb) => {
    if (!socket.github) return cb(ERRORS.MISSING_GITHUB);

    socket.github.users.get(options, function(err, res) {
      return cb(err && err.message, res);
    });
  });

  /**
  Get repository information
  */
  socket.on(EVENTS.GITHUB_REPO, (options, cb) => {
    if (!socket.github) return cb(ERRORS.MISSING_GITHUB);

    socket.github.repos.get(options, function(err, res) {
      return cb(err && err.message, res);
    });
  });


  /**
  Get repositories for user
  */
  socket.on(EVENTS.GITHUB_USER_REPOS, (options, cb) => {
    if (!socket.github) return cb(ERRORS.MISSING_GITHUB);

    _.merge(options, {
      per_page: 100
    });
    socket.github.getAllPages(socket.github.repos.getAll, options, function(err, res) {
      // console.log(res.map(function(repo) { return repo['full_name']; }));
      // console.log(res.length);
      return cb(err && err.message, res);
    });

  });

};