// Dependencies
const config = require('config');
const GitHubApi = require("github");
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const async = require('async');
const {getIssues} = require('../src/issues');

// Setup client(s)
const GitHubToken = config.get('github.token');
const github = new GitHubApi({
  debug: false,
});
// OAuth2
github.authenticate({
    type: "oauth",
    token: GitHubToken
});

// Get list of Issues for repository
// let user = 'Glavin001';
// let repo = 'atom-beautify';
let user = 'reactjs';
let repo = 'redux';
// let user = 'nodejs';
// let repo = 'node';
let dataPath = path.resolve(__dirname, '../data/',user,repo);
console.log('dataPath', dataPath);
async.parallel([
  (cb) => mkdirp(dataPath, cb),
  (cb) => {
    function showProgress({percent}) {
      console.log('progress', percent);
    }
    getIssues(github, user, repo, showProgress)
    .then((issues) => {
      return cb(null, issues);
    })
    .catch((err) => {
      return cb(err);
    })
  }
], (err, results) => {

  // Get contents for each Issue
  // console.log(err, issues);
  let issues = results[1];
  issues = _.map(issues, (issue) => {
    issue.labels = _.map(issue.labels, 'name');
    issue.milestone = _.get(issue.milestone, 'title') || null;
    return _.pick(issue, ['number','pull_request','state','title','body','labels','milestone']);
  });


  console.log('Number of Issues: ',issues.length);
  fs.writeFile(path.resolve(dataPath, 'issues.json'), JSON.stringify(issues, undefined, 4), (err) => {
    console.log(err);
  });

});

