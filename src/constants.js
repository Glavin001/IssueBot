
module.exports = Object.freeze({
  EVENTS: {
    AUTHENTICATE: 'authenticate',
    REPOSITORY_SYNC: 'repository sync',
    REPOSITORY_SYNC_PROGRESS: 'repository sync progress',
    PARSE_REPOSITORY_URL: 'repository validate url',
    GITHUB_USER: 'github /user',
    GITHUB_REPO: 'github /repos/:user/:repo',
    GITHUB_USER_REPOS: 'github /user/repos',
  },
  ERRORS: {
    MISSING_GITHUB: 'Missing GitHub token. Please authenticate first and try again.'
  },
  REPOSITORY_SYNC_TASKS: {
    REPO: 'Retrieving repository information',
    ISSUES: 'Retrieving issues for repository',
    DATABASE: 'Syncing repository and issues with database',
    WEBHOOK: 'Setting up Webhooks for repository',
    TRAIN: 'Training model for repository',
  }
});