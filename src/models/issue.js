"use strict";

const _ = require('lodash');

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
        return Repository.predictIssueLabels(issue)
        .then((results) => {
          // TODO: Apply labels, etc
          console.log('labelIssue', results);
        });
      },
      webhook(event) {
        let {payload} = event;
        // Upsert the Issue
        let issue = Issue.transformFields(payload.issue);
        let repoId = _.get(payload,'repository.id');
        issue.repository_id = repoId;
        console.log('Upserting Issue', issue, event);
        return Issue.upsert(issue)
        .then(() => {
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