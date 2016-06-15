# IssueBot

> Your person assistant for automatically organizing and replying to Issue.

---

## Why `IssueBot`?

- Does this look familiar?   
  <img width="356" alt="issue-bot-issues-count-nodejs" src="https://cloud.githubusercontent.com/assets/1885333/16065496/a4efe15c-3281-11e6-9500-9e2d24bf29eb.png">
- Are you maintaining a project with many issues and finding it difficult to stay organized?
- Seeing double, or more, because your users will submit duplicate issues without searching first?
- Wish you had someone else to help manage your Issues with you?

If you find yourself saying **Yes**, then `IssueBot` is made for you!

Skip to [**Step 5. Profit** section](#step-5-profit) below for some screenshots and a feature overview!

Skip to [**Installation** section](#installation) below for instructions on how to run the service yourself!


## Getting Started

### Step 1. Login with GitHub

Start off by logging into GitHub!

<img width="1002" alt="issue-manager-login" src="https://cloud.githubusercontent.com/assets/1885333/16065191/ca33f992-327e-11e6-8728-84cc72c9b4bc.png">


### Step 2. Sign in to your GitHub account

If you are not already signed into GitHub you will see the following form.

<img width="513" alt="issue-bot-github-sign-in" src="https://cloud.githubusercontent.com/assets/1885333/16065189/ca2dc1f8-327e-11e6-9c76-b3972f289d56.png">

### Step 3. Enter the URL of a GitHub Repository

Once you are authenticated with your GitHub account you will be able to sync a repository.

<img width="1192" alt="issue-bot-enter-repo" src="https://cloud.githubusercontent.com/assets/1885333/16065190/ca2e9e02-327e-11e6-8e4e-b6a1190ad331.png">

Simply enter the URL for a repository you wish to sync!

<img width="1201" alt="issue-bot-entered-repo" src="https://cloud.githubusercontent.com/assets/1885333/16065188/ca2182bc-327e-11e6-9334-c63898b26dc6.png">

### Step 4. Syncing & Training

Be patience while the repository is syncing and training predictive machine learning models.

<img width="1180" alt="issue-bot-syncing" src="https://cloud.githubusercontent.com/assets/1885333/16065233/48b85a06-327f-11e6-925d-4855ddbd7987.png">

### Step 5. Profit!

![profit](http://pix-media.s3.amazonaws.com/blog/778/75135-Breaking-Bad-money-bed-Huell-5-pJrx.jpeg)

#### Automatically Manage Issues

Using GitHub Webhooks, Issues will be processed automatically.

| Automatically Label Issues | Find similar / duplicate issues |
| --- | --- |
| Example of Issue automatically labelled as `bug` | Example of Issue labelled as `question` and similar issue suggested |
| ![issue-bot-issue-labelling](https://cloud.githubusercontent.com/assets/1885333/16065305/eaf29868-327f-11e6-9d1d-4a6cc82bc313.png) | ![issue-bot-issue-labelling-similarity](https://cloud.githubusercontent.com/assets/1885333/16065304/eae259c6-327f-11e6-869f-7af8970cb215.png) |


#### Example Results

When you are done syncing you will receive a report.
Here are some examples.

| | Labels | Duplicates |
| --- | --- | --- |
| **Description** | Predict Issue Labels | Find similar/duplicate issues |
| Glavin001/atom-beautify | ![](https://cloud.githubusercontent.com/assets/1885333/16065074/9862bd5a-327d-11e6-84fa-7196df27f770.png) | ![](https://cloud.githubusercontent.com/assets/1885333/16065073/984c970a-327d-11e6-9c97-c3b501532d6a.png) |
| Facebook/react | ![](https://cloud.githubusercontent.com/assets/1885333/16064907/ee3db7d6-327b-11e6-9912-1d5d809d1271.png) | ![](https://cloud.githubusercontent.com/assets/1885333/16064908/ee564ec2-327b-11e6-9f81-4134b379b3be.png) |
| nodejs/node | ![screen shot 2016-06-14 at 7 00 07 pm](https://cloud.githubusercontent.com/assets/1885333/16061254/71d912da-3262-11e6-99e7-410c1faa8059.png) | ![issue-bot-duplicates-nodejs](https://cloud.githubusercontent.com/assets/1885333/16061130/de676ff6-3261-11e6-9d81-e0bc7353a17a.png) |


## Installation

**Note**: Installation process needs a little love.
Below are details for how I get it running on my machine.

### Config

[node-config](https://github.com/lorenwest/node-config) handles configuration.
Create a local configuration file, that will be ignored by Git:

```bash
cp config/default.js config/local.js
```

### GitHub App

Go to https://github.com/settings/developers and `Register a new application`.
Replace `github.client_id` (`CLIENT_ID`) and `github.client_secret` (`CLIENT_SECRET`) in `config/local.js`.

**Optional**: If you want to run `node scripts/get-issues.js` you should create a `Personal access token` at https://github.com/settings/tokens and replace `github.token` (`TOKEN`) in `config/local.js`.


### Database

1. Install [PostgreSQL](https://www.postgresql.org)
2. Create database with `createdb issuemanager`
3. Create database user with:

  ```bash
$ psql issuemanager
issuemanager=# create user issuemanager password 'CHANGE_ME_PASSWORD';
```

4. Edit your configuration in `config/local.js` under key `db`.
5. Test database with `node scripts/test-db.js`

### Tunnels to Localhost

Install [ngrok](https://ngrok.com) and run the following:

```bash
ngrok http -subdomain=issue-manager-web 8080
ngrok http -subdomain=issue-manager 8081
```

Edit `config/local.js` to have the following corresponding configuration:

```
"server": {
  "base_url": "http://issue-manager.ngrok.io",
  "port": 8081
},
"app": {
  "base_url": "http://issue-manager-web.ngrok.io"
},
```

### Python

Install [Python](https://www.python.org) and [pip](https://pip.pypa.io/en/stable/installing/) the run the following:

```bash
pip install -r requirements.txt
```

### Node.js

Install dependencies with `npm install`.

Start [Webpack](https://webpack.github.io) development server with `npm run start:webpack`.

Finally, start the server with `npm run start:server`.

**Note**: `npm start` is equivalent to running both `npm run start:webpack` and `npm run start:server` in parallel.

Go to http://issue-manager-web.ngrok.io to view the web application!


