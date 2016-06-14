'use strict';

const PythonShell = require('python-shell');
const path = require('path');

function _run(data) {
  return new Promise((resolve, reject) => {

    // TODO: Use Pool of PythonShell workers
    var pyshell = new PythonShell('bin.py', {
        mode: 'text',
        scriptPath: __dirname,
    });
    let message = null;
    pyshell.on('message', (m) => {
        try {
          message = JSON.parse(m);
          console.log('JSON Message: ');
          console.log(JSON.stringify(message, undefined, 2));
        } catch (err) {
          console.log('Text Message: ', m);
        }
    });

    pyshell.send(JSON.stringify(data))
    .end(function (err) {
        if (err && !message) return reject(err);
        resolve(message);
    });

  });
}

function train(trainType, data) {
  console.log('Training',trainType,data);
  return _run([
    "train_"+trainType,
    data
  ]);
}

function predictIssueLabels(user, repo, issue) {
  return predictIssuesLabels(user, repo, [issue]);
}

function predictIssuesLabels(user, repo, issues) {
  return _run([
    "predict_labels",
    [
      user, repo, issues
    ]
  ]);
}

module.exports = {
  train,
  predictIssueLabels,
  predictIssuesLabels,
};

