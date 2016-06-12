const config = require('config');
const GitHubApi = require("github");
const GitHubToken = config.get('github.token');
const github = new GitHubApi({
  debug: false,
});

module.exports = function(socket) {
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('/user', (token, cb) => {
    console.log('/user', token);
    github.authenticate({type: "oauth", token: token});
    github.users.get({}, function(err, res) {
      return cb(err, res);
    });
  });

  socket.on('/user/repos', (token, cb) => {
    console.log('/user/repos', token);

    github.authenticate({type: "oauth", token: token});
    github.getAllPages(github.activity.getStarredRepos, {
      per_page: 100
    }, function(err, res) {
      // console.log(res.map(function(repo) { return repo['full_name']; }));
      // console.log(res.length);
      return cb(err, res);
    });

  });

};