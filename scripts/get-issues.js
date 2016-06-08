// Dependencies
const config = require('config');
const GitHubApi = require("github");
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const async = require('async');

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

// ===== Helpers =======

// http://davidarvelo.com/blog/array-number-range-sequences-in-javascript-es6/
// create a generator function returning an
// iterator to a specified range of numbers
function* range(begin, end, interval = 1) {
  for (let i = begin; i < end; i += interval) {
    yield i;
  }
}

// Get list of Issues for repository
const githubPageSize = 100;
//'Glavin001';
//'atom-beautify';
// let user = 'reactjs';
// let repo = 'redux';
let user = 'nodejs';
let repo = 'node';
let dataPath = path.resolve(__dirname, '../data/',user,repo);
console.log('dataPath', dataPath);
async.parallel([
  (cb) => mkdirp(dataPath, cb),
  (cb) => {
    // FIXME: make this dynamic
    let numOfIssues = 5000;

    // Get all Repositories
    let pages = range(1, parseInt(numOfIssues / githubPageSize) + 2, 1);
    async.map(pages, (page, cb) => {
      github.issues.getForRepo({
        user,
        repo,
        page,
        state: 'all',
        per_page: githubPageSize,
      }, cb);
    }, (error, issues) => {
      if (error) {
        return cb(error);
      }
      issues = _.flatten(issues);
      return cb(null, issues);
    })
  }
], (err, results) => {
  // Get contents for each Issue
  // console.log(err, issues);
  let issues = results[1];
  issues = _.map(issues, (issue) => {
    let labels = _.map(issue.labels, 'name');
    return {
      number: issue.number,
      pull_request: issue.pull_request,
      state: issue.state,
      text: `${issue.title} \n ${issue.body}`,
      labels: labels
    };
  });


  console.log('Number of Issues: ',issues.length);
  fs.writeFile(path.resolve(dataPath, 'issues.json'), JSON.stringify(issues, undefined, 4), (err) => {
    console.log(err);
  });

});

