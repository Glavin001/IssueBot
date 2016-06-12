'use strict';

const PythonShell = require('python-shell');
const path = require('path');

module.exports = {
  train(issues) {
    return new Promise((resolve, reject) => {

      var pyshell = new PythonShell('classifier.py', {
          mode: 'json',
          scriptPath: __dirname,
      });
      let message = null;
      pyshell.on('message', (m) => {
          console.log('message');
          message = m;
      });

      pyshell.send(issues)
      .end(function (err) {
          if (err) return reject(err);
          resolve(message);
      });

    });
  }
}