const config = require('config');
const {EVENTS, ERRORS, REPOSITORY_SYNC_TASKS} = require('../constants');
const GitHubApi = require("github");
const parseGitHubUrl = require('parse-github-url');
const {Repository, Issue} = require('../models');
const async = require('async');
const _ = require('lodash');
const {getIssues} = require('../issues');
const {train, issueSimilarities} = require('../classifier');

const github = new GitHubApi({debug: false});

module.exports = function(socket, io) {

  socket.on(EVENTS.PARSE_REPOSITORY_URL, (repositoryUrl, cb) => {
    try {
      let repo = parseGitHubUrl(repositoryUrl);
      return cb(repo);
    } catch (err) {
      return cb(null);
    }
  });

  /**
  Sync repository issues
  */
  socket.on(EVENTS.REPOSITORY_SYNC, (repository_url, cb) => {
    if (!socket.github)
      return cb(ERRORS.MISSING_GITHUB);

    // Validate repo URL
    let repo = parseGitHubUrl(repository_url);
    if (repo && repo.name) {
      // Join Repository room
      let repoRoom = `repo:${repo.repo}`;
      socket.join(repoRoom);

      // Repository specific progress emitter
      let progress = (data) => {
        // console.log('Progress', data);
        io.sockets. in(repoRoom).emit(EVENTS.REPOSITORY_SYNC_PROGRESS, data);
      };

      // Get all Issues for a GitHub Repository
      let {owner, name} = repo;
      console.log("repo", repo);

      async.auto({
        /**
        Get repository information
        */
        repo: (cb) => {
          progress({
            task: REPOSITORY_SYNC_TASKS.REPO,
            percent: 0
          });

          socket.github.repos.get({
            owner,
            repo: name
          }, (err, { data }) => {
            if (err) {
              return cb(err);
            }
            repo = Repository.transformFields(data);
            // Attach the authentication token for repository access later
            repo.token = socket.token;

            progress({
              task: REPOSITORY_SYNC_TASKS.REPO,
              percent: 1
            });

            return cb(null, repo);
          });
        },
        /**
        Get all Issues for repository
        */
        issues: (cb) => {

          function showProgress({percent}) {
            progress({
              task: REPOSITORY_SYNC_TASKS.ISSUES,
              percent: percent
            });
          }
          getIssues(socket.github, owner, name, showProgress)
          .then((results) => {
            // console.log('Has Issues!', results.length);
            // Transform GitHub Issues list
            let issues = _.map(results, Issue.transformFields);

            progress({
              task: REPOSITORY_SYNC_TASKS.ISSUES,
              percent: 1
            });

            // console.log('Finished getting issues!');
            cb(null, issues);
          })
          .catch((err) => {
            cb(err);
          });
        },
        /**
        Create records for Repository and Issues
        */
        records: ['repo', 'issues', (results, cb) => {
          // console.log('Bulk insert records!');

          progress({
            task: REPOSITORY_SYNC_TASKS.DATABASE,
            percent: 0
          });

          // Insert Repository
          let repo = results.repo;
          let {issues} = results;
          let repoId = repo.id;
          console.log('repo', repo);
          Repository.upsert(repo)
          .then(() => {
            progress({
              task: REPOSITORY_SYNC_TASKS.DATABASE,
              percent: 0.5
            });

            // Delete any existing Issues
            // Sequelize + PostgreSQL does not support Bulk+Upsert
            return Issue.destroy({where:{repository_id: repoId}});
          })
          .then(() => {
            // Bulk Insert Issues
            _.each(issues, (issue) => {
              // Associate Issue with Repository
              issue.repository_id = repoId;
            });
            progress({
              task: REPOSITORY_SYNC_TASKS.DATABASE,
              percent: 0.6
            });
            return Issue.bulkCreate(issues);
          })
          .then((issues) => {
            progress({
              task: REPOSITORY_SYNC_TASKS.DATABASE,
              percent: 1
            });
            return cb(null, issues);
          })
          .catch((err) => {
            return cb(err);
          });

        }],
        /**
        Create webhooks for repository

        See https://developer.github.com/v3/repos/hooks/#create-a-hook
        and http://mikedeboer.github.io/node-github/#api-repos-createHook
        */
        webhooks: ['repo', (results, cb) => {
          progress({
            task: REPOSITORY_SYNC_TASKS.WEBHOOK,
            percent: 0
          });

          let {repo} = results;
          // let webhookUrl = `${config.get('server.base_url')}/webhook/${repo.owner}/${repo.name}`;
          let webhookUrl = `${config.get('server.base_url')}/webhook`;
          socket.github.repos.createHook({
            owner: repo.owner,
            repo: repo.name,
            name: 'web',
            events: ['issues','issue_comment','pull_request'],
            active: true,
            config: {
              url: webhookUrl,
              content_type: 'json',
              secret: config.get('github.webhook_secret')
            }
          }, (err) => {
            if (err) {
              // console.log('webhook error', err);
              let errorMessage = err && err.message;
              try {
                errorMessage = _.get(JSON.parse(err.message), 'errors[0].message');
              } catch (err) {
                // Don't worry about it right now.
                // These errors are likely because of duplicate webhook.
                // We can write webhooks but cannot read, so we write assuming it does not exist
                // and fail silently otherwise.

                // TODO: Check if error message is related to this being a duplicate webhook
              }
              progress({
                task: REPOSITORY_SYNC_TASKS.WEBHOOK,
                percent: 1,
                message: errorMessage
              });
            } else {
              progress({
                task: REPOSITORY_SYNC_TASKS.WEBHOOK,
                percent: 1,
              });
            }
            return cb();
          });
        }],
        /**
        Train model to label issues
        */
        train_labels: ['repo', 'issues', 'records', (results, cb) => {
          progress({
            task: REPOSITORY_SYNC_TASKS.TRAIN_LABELS,
            percent: 0
          });
          let issues = results.issues;

          let {repo} = results;
          let {owner, name} = repo;
          let ignoreLabels = []; // TODO

          train('labels', [owner, name, issues, ignoreLabels])
          .then((resp) => {
            progress({
              task: REPOSITORY_SYNC_TASKS.TRAIN_LABELS,
              percent: 1
            });
            return cb(null, resp);
          })
          .catch((err) => {
            progress({
              task: REPOSITORY_SYNC_TASKS.TRAIN_LABELS,
              percent: 1,
              message: err.message
            });
            return cb(err);
          });

        }],
        /**
        Train model to detect duplicate issues
        */
        issue_similarities: ['issues', (results, cb) => {
          progress({
            task: REPOSITORY_SYNC_TASKS.ISSUE_SIMILARITIES,
            percent: 0
          });
          let issues = results.issues;

          issueSimilarities(issues)
          .then((resp) => {
            progress({
              task: REPOSITORY_SYNC_TASKS.ISSUE_SIMILARITIES,
              percent: 1
            });
            return cb(null, resp);
          })
          .catch((err) => {
            progress({
              task: REPOSITORY_SYNC_TASKS.ISSUE_SIMILARITIES,
              percent: 1,
              message: err.message
            });
            return cb(err);
          });

        }],
        /**
        Train model to predict assignees for issues
        */
        train_assignees: ['repo', 'issues', 'records', (results, cb) => {
          progress({
            task: REPOSITORY_SYNC_TASKS.TRAIN_ASSIGNEES,
            percent: 1
          });
          return cb();
        }],
        /**
        Train model to predict milestones for issues
        */
        train_milestones: ['repo', 'issues', 'records', (results, cb) => {
          progress({
            task: REPOSITORY_SYNC_TASKS.TRAIN_MILESTONES,
            percent: 1
          });
          return cb();
        }]
      }, (err, results) => {
        // console.log('Done!', err, Object.keys(results));
        socket.leave(repoRoom);
        return cb(err && err.message, results);
      });

    } else {
      // Repository URL was invalid
      return cb('Invalid repository URL. Please try again.');
    }

  });

};