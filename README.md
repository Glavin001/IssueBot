# IssueBot

> Automate Issue replies and organization

---

### Why `IssueBot`

- Are you maintaining a project with many issues and finding it difficult to keep up?
- Seeing double, or more, because your users will submit duplicate issues without checking first?
- Want to know which issues should be top priority and which could wait?
- Wish you had someone else to help manage your Issues with you?

Then `IssueBot` is made for you!

### About `IssueBot`

IssueBot monitors the Issues created on projects and tries to automate the chores as much as possible.

#### Issue Deduplication

Often users will not search through previous Issues to discover if their question or concern has already been addressed. IssueBot will read their new issue and attempt to do that work for them and you, and if a match is found, it will mark the Issue as a duplicate and forward the user over to the original Issue.

#### Prioritizing

IssueBot will analyze issue content and historical trends to determine which should be high or low priority.
It will label those issues appropriate so that when you have time to develop you know exactly which issues to pay most attention to.

## Installation

1. Install PostgreSQL
2. Create database with `createdb issuemanager`
3. Create database user with:

  ```bash
$ psql issuemanager
issuemanager=# create user issuemanager password 'CHANGE_ME_PASSWORD';
```

4. Test database with `node scripts/test-db.js`
5. Start the server with `npm start`
