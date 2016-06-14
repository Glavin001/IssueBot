const async = require('async');
const _ = require('lodash');

// ===== Helpers =======
// http://davidarvelo.com/blog/array-number-range-sequences-in-javascript-es6/
// create a generator function returning an
// iterator to a specified range of numbers
function * range(begin, end, interval = 1) {
  for (let i = begin; i < end; i += interval) {
    yield i;
  }
}

const githubPageSize = 100;

module.exports = {

  getIssues(github, user, repo, progressCb) {


    return new Promise((resolve, reject) => {

      // FIXME: make this dynamic
      // let numOfIssues = 5000;

      github.search.issues({
        q: `repo:${user}/${repo}`,
        page: 1,
        per_page: 1
      }, (err, results) => {
        if (err) {
          return reject(err);
        }
        // console.log('search', err, results);
        let numOfIssues = results.total_count;
        let completed = 0;
        const progress = () => {
          if (typeof progressCb === 'function') {
            progressCb({
              total: numOfIssues,
              completed: completed,
              pending: numOfIssues - completed,
              percent: completed/numOfIssues,
            });
          }
        }

        // Get all Repositories
        let pages = range(1, parseInt(numOfIssues / githubPageSize) + 2, 1);
        async.map(pages, (page, cb) => {
          github.issues.getForRepo({
            user,
            repo,
            page,
            state: 'all',
            per_page: githubPageSize
          }, (err, issues = []) => {

            completed += issues.length;
            progress();

            return cb(err, issues);
          });
        }, (error, issues) => {
          if (error) {
            return reject(error);
          }
          // Ensure that Issue is formated properly
          issues = _.map(_.flatten(issues), (issue) => {
            issue.title = issue.title || '';
            issue.body = issue.body || '';
            return issue;
          });
          return resolve(issues);
        })

      });

      // FIXME: This can be run in parallel instead of sequentially
      /*
      This could be streamed such that pages of Issues are
      loaded, transformed, and inserted into database,
      in parallel while the next page is loading.
      */
      // Cite: https://github.com/mikedeboer/node-github/blob/483789441123ce7df1e0b5ecbdc8d94e293bdaa4/lib/index.js#L425
      // github.getAllPages(github.issues.getForRepo, {
      //   user,
      //   repo,
      //   state: 'all',
      //   per_page: githubPageSize
      // }, cb);

      // // FIXME: This can be run in parallel instead of sequentially
      // /*
      // This could be streamed such that pages of Issues are
      // loaded, transformed, and inserted into database,
      // in parallel while the next page is loading.
      // */
      // // Cite: https://github.com/mikedeboer/node-github/blob/483789441123ce7df1e0b5ecbdc8d94e293bdaa4/lib/index.js#L425
      // socket.github.getAllPages(socket.github.issues.getForRepo, {
      //   user: owner,
      //   repo: name,
      //   per_page: 100
      // }, function(err, results = []) {
      //   if (err) {
      //     return cb(err);
      //   }

    });

  }

};