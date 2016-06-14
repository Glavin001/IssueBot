"use strict";

const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  var Repository = sequelize.define("Repository", {
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING
    }
  }, {
    instanceMethods: {
      train() {
        return Promise.all([
          this.trainLabels(),
        ]);
      },
      trainLabels() {
        // TODO:
        console.log(`Train issue labels for repository: ${this.id}`);

        // Get all associated Issues
        const {Issue} = require('../models');
        return Issue.findAll({
          where: {
            repository_id: this.id
          }
        }).then((issues) => {
          issues = _.map(issues, (issue) => issue.toJSON());
          console.log('Found issues!', issues.length, issues);

          // Create dataset for training
          let {owner, name} = this;
          let ignoreLabels = []; // TODO

          const {train} = require('../classifier');
          // Start the training
          return train('labels', [owner, name, issues, ignoreLabels])
          .then((resp) => {
            console.log(`Finished training repository '${this.owner}/${this.name}' with ${issues.length} issues`);
            console.log(JSON.stringify(_.pick(resp, ['score','wrong','total','percentage','newly_labeled_issues']), undefined, 2));
            return resp;
          });
        })
        .catch((error) => {
          console.error(error);
          return error;
        });
      },
      predictIssueLabels(issue) {
        const {predictIssueLabels} = require('../classifier');
        return predictIssueLabels(this.owner, this.name, issue);
      }
    },
    classMethods: {
      associate: function(models) {
        Repository.hasMany(models.Issue, {
          foreignKey: {
            name: 'repository_id'
          }
        });
      },
      transformFields(repo) {
        // Pick only the used fields
        repo = _.pick(repo, ['id','owner','name','description']);
        // Simplify the owner field
        repo.owner = _.get(repo, 'owner.login');
        return repo;
      },
      train(repoId) {
        return Repository.findById(repoId)
        .then((repo) => {
          return repo.train();
        });
      },
      predictIssueLabels(issue) {
        let repoId = issue.repository_id;
        // Find Repository associated with this Issue
        return Repository.findById(repoId)
        .then((repo) => {
          return repo.predictIssueLabels(issue);
        });
      },
      webhook(event) {
        // TODO: Handle changes to repository
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['owner', 'name']
      }
    ]
  });

  return Repository;
};