'use strict';

const PythonShell = require('python-shell');
const path = require('path');

module.exports = {
  train(trainType, data) {
    return new Promise((resolve, reject) => {
      console.log('Training',trainType,data);
      // if (issues.length <= 1) {
      //   return reject(new Error('Training requires a list of Issues to learn from.'));
      // }

      // TODO: Use Pool of PythonShell workers
      var pyshell = new PythonShell('bin.py', {
          mode: 'text',
          scriptPath: __dirname,
      });
      let message = null;
      pyshell.on('message', (m) => {
          console.log('message:', m);
          try {
            message = JSON.parse(m);
          } catch (err) {}
      });

      pyshell.send(JSON.stringify([
        "train_"+trainType,
        data
      ]))
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
          mode: 'text',
          scriptPath: __dirname,
      });
      let message = null;
      pyshell.on('message:', (m) => {
        console.log('message', m);
        try {
          message = JSON.parse(m);
        } catch (err) {}
      });

      pyshell.send(JSON.stringify([
        "predict_labels",
        [
          user, repo, [issue]
        ]
      ]))
      .end(function (err) {
          if (err) return reject(err);
          resolve(message);
      });
    });
  }

}