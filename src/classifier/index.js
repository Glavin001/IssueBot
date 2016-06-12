'use strict';

const PythonShell = require('python-shell');
const path = require('path');

module.exports = {
  train(user, repo, issues, ignoreLabels = []) {
    return new Promise((resolve, reject) => {
      if (issues.length <= 1) {
        return reject(new Error('Training requires a list of Issues to learn from.'));
      }

      // TODO: Use Pool of PythonShell workers
      var pyshell = new PythonShell('bin.py', {
          mode: 'json',
          scriptPath: __dirname,
      });
      let message = null;
      pyshell.on('message', (m) => {
          console.log('message');
          message = m;
      });

      pyshell.send([
        "train",
        [
          user, repo, issues, ignoreLabels
        ]
      ])
      .end(function (err) {
          if (err) return reject(err);
          resolve(message);
      });

    });
  },

  predictIssueLabels(user, repo, issue) {
    return new Promise((resolve, reject) => {
      // TODO: Use Pool of PythonShell workers
      var pyshell = new PythonShell('bin.py', {
          mode: 'json',
          scriptPath: __dirname,
      });
      let message = null;
      pyshell.on('message', (m) => {
          console.log('message');
          message = m;
      });

      pyshell.send([
        "predict_labels",
        [
          user, repo, issue
        ]
      ])
      .end(function (err) {
          if (err) return reject(err);
          resolve(message);
      });
    });
  }

}