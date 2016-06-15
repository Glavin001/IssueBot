"use strict";

const _ = require('lodash');
const {issueSimilarities} = require('../classifier');

module.exports = function(sequelize, DataTypes) {
  var Issue = sequelize.define("Issue", {
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    labels: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    milestone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Issue.belongsTo(models.Repository, {
          foreignKey: {
            name: 'repository_id',
            allowNull: false
          }
        });
      },
      transformFields(issue) {
        // Pick only the used fields
        issue = _.pick(issue, ['id','number','state','title','body','labels','milestone']);
        issue.labels = _.map(issue.labels, 'name');
        issue.milestone = _.get(issue.milestone, 'title');
        return issue;
      },
      labelIssue(issue) {
        const {Repository} = require('../models');
        return Repository.forIssue(issue)
        .then((repo) => {
          return repo.predictIssueLabels(issue)
          .then((results) => {
            console.log('labelIssue', JSON.stringify(results));
            let [number, data] = results;
            let [,labels, confidenceMap] = data;
            if (labels.length > 0) {
              let labelsWithConfidence = _.map(labels, (label) => {
                let confidence = (confidenceMap[label] * 100).toFixed(2);
                return `\`${label}\` (${confidence}% confident)`
              });
              let comment = `I have added labels ${labelsWithConfidence.join(', ')}.`;
              return Promise.all([
                repo.addLabelsToIssue(issue, labels),
                repo.addCommentToIssue(issue, comment)
              ]);
            }
          });
        });
      },
      issuesForRepo(repoId) {
        return Issue.findAll({
          where: {
            repository_id: repoId
          }
        });
      },
      webhook(event) {
        let {payload} = event;
        // Upsert the Issue
        let issue = Issue.transformFields(payload.issue);
        let repoId = _.get(payload,'repository.id');
        issue.repository_id = repoId;
        // console.log('Upserting Issue', issue, event);
        return Issue.upsert(issue)
        .then(() => {
          return Promise.all([
            // Labelling
            (() => {
              // Check if labelled
              if (issue.labels.length > 0) {
                // Is labelled
                // Schedule repository training
                const {Repository} = require('../models');
                return Repository.train(repoId);
              } else {
                // Is NOT labelled
                // Attempt to label it
                return Issue.labelIssue(issue);
              }
            })(),
            // Similarity / Duplicates
            Issue.issuesForRepo(repoId)
            .then((issues) => {
              // console.log(`issuesForRepo ${repoId}: ${issues.length}`);
              // Analyze all current Issues
              return issueSimilarities(issues);
            })
            .then((issueSimilarities) => {
              // Extract only this Issue's relevant similarities
              let similar = issueSimilarities[issue.number] || {};
              let similarCount = Object.keys(similar).length;
              let plural = similarCount > 1;
              console.log('issueSimilarities', issueSimilarities);
              // Is there any similar issues?
              // Yes: write a comment and let people know!
              if (similar && similarCount > 0) {
                // console.log(issue.number, similar);
                let similarStr = _.map(similar, (score, num) => {
                  return `#${num} (${(score*100).toFixed(2)}% similar)`
                }).join(', ');
                let message = `I recommend that you take a look at ${plural?'these':'this'} similar issue${plural?'s':''} I found: ${similarStr}`;
                // console.log(issue.number, message);
                return message;
              } else {
                // No: ignore, carry on
                return;
              }
            })
            .then((message) => {
              if (message) {
                const {Repository} = require('../models');
                return Repository.forIssue(issue)
                .then((repo) => {
                  return repo.addCommentToIssue(issue, message);
                });
              }
            })
          ]);
        })
        .catch((error) => {
          console.warn('Webhook error: ');
          console.error(error);
        });
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['repository_id', 'number']
      }
    ]
  });

  return Issue;
};