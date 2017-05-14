'use strict';
const path = require('path');
const { train } = require('../src/classifier');
const fs = require('fs');

// Get list of Issues for repository
let owner = 'Glavin001';
let repo = 'atom-beautify';
// let user = 'reactjs';
// let repo = 'redux';
// let user = 'nodejs';
// let repo = 'node';
let dataPath = path.resolve(__dirname, '../data/', owner, repo);

const issues = require(path.resolve(dataPath, 'issues.json'));
console.log('Issues: '+issues.length);
const ignoreLabels = ['published', 'cannot-reproduce', 'high priority', 'in-progress', 'invalid', 'quick-todo', 'update-dependency', 'waiting-for-user-information', 'linux', 'mac'];
train('labels', [owner, repo, issues, ignoreLabels])
.then((results) => {
  console.log('finished!');
  fs.writeFileSync(path.resolve(dataPath,'results.json'), JSON.stringify(results, undefined, 2));
})
.catch((error) => {
  console.error(error);
})