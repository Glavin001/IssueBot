const assert = require('chai').assert;
const { train, predictIssueLabels, issueSimilarities } = require('../src/classifier');

// Config
const owner = 'test';
const repo = 'test';

describe('Classifier', function() {
  describe('#train()', function () {
    it('should return training results', function () {
      let issues = require('./fixtures/issues_1.json');
      return train('labels', [owner, repo, issues, []])
      .then((results) => {
        // console.log(results);
        assert.equal(results.ok, true);
        assert.equal(results.issues.total, issues.length);
      });
    });

    it('should return error complaining not enough issues', function () {
      return train('labels', [owner, repo, [], []])
      .then((results) => {
        // console.log(results);
        assert.equal(results.ok, false);
        assert.equal(results.error_message, "Number of different labels provided was insufficient.");
      });
    });


  });
});