import React, { Component } from 'react';
import { EVENTS, REPOSITORY_SYNC_TASKS } from '../../../../src/constants';
import { If, Then, Else } from 'react-if';
import _ from 'lodash';
import Graph from './graph';

export default class Syncing extends Component {

  static contextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.syncRepo = this.syncRepo.bind(this);

    const { location } = this.props;
    const { query } = location;
    const {
      repository_url: repositoryUrl,
      access_token: token
    } = query;
    this.state = {
      repositoryUrl,
      token,
    };
  }

  componentDidMount() {
    console.log('Syncing!');
    this.resetTasks();

    // Re-login, in case user refreshes page
    // Note: this also makes development a lot easier ;)
    this.context.socket.emit(EVENTS.AUTHENTICATE, this.state.token, (err, user) => {
      console.log(err, user);
      this.setState({
        user
      });

      this.syncRepo();

    });

    this.context.socket.on(EVENTS.REPOSITORY_SYNC_PROGRESS, (data) => {
      console.log('progress', data);

      let {tasks} = this.state;
      tasks[data.task] = data.percent;
      this.setState({tasks});

    });

  }

  resetTasks() {
    let tasks = _.chain(REPOSITORY_SYNC_TASKS).values().map((t) => [t,null]).fromPairs().value();
    console.log('tasks', tasks);
    this.setState({
      tasks,
      doneTasks: false
    });
  }

  syncRepo() {

    this.context.socket.emit(EVENTS.REPOSITORY_SYNC, this.state.repositoryUrl, (err, results) => {
      console.log('sync', err, results);
      this.setState({
        doneTasks: true,
        results,
      })
      setTimeout(() => {
        // Scroll to show results below
        // Cite: http://stackoverflow.com/a/4801674/2578205
        document.getElementById('training-results').scrollIntoView( true );
      }, 1);
    });

  }

  issueSimilaritiesToGraph(repo, issueSimilarities) {
    let similarityThreshold = 0.7;

    console.log('issueSimilarities', issueSimilarities);
    let nodeIndices = {};
    let nodes = _.map(issueSimilarities, (v,k) => {
      let node = {
        key: k,
        text: `#${k}`,
        size: Object.keys(v).length,
        url: `https://github.com/${repo.owner}/${repo.name}/issues/${k}`,
      };
      nodeIndices[k] = node;
      return node;
    });
    nodeIndices = _.mapValues(nodeIndices, (node) => {
      return _.indexOf(nodes, node);
    });
    let links = _.flatten(_.map(issueSimilarities, (v,source) => {
      return _.map(v, (score, target) => {
        let size = (score-similarityThreshold) / (1.0-similarityThreshold);
        return {
          source: nodeIndices[source],
          target: nodeIndices[target],
          key: `${source}-${target}`,
          size,
        };
      })
    }));
    let graph =  { nodes, links };
    console.log('issueSimilaritiesToGraph', graph);
    return graph;
  }

  render() {

    let trainLabels = _.get(this.state, 'results.train_labels');
    let repo = _.get(this.state, 'results.repo') || {};
    let issueSimilarities = _.get(this.state, 'results.issue_similarities') || {};

    return (<div>
        <h1>Issue Manager</h1>
        <button className="btn btn-primary" onClick={this.syncRepo}>Sync</button>
        <hr/>
        <div>
          {_.map(this.state.tasks, (value, task) => {
            if (value == null) {
              return (<div key={task} className="">
                <div className="">
                  <span className="lead">
                    <span>
                      <i className={"fa "+(value >= 1.0 ? "fa-check text-success" : "fa-refresh fa-spin fa-fw text-info")} aria-hidden="true"></i>
                    </span>
                    <span>{task}</span>
                  </span>
                  <div className="text-info">
                    Task has not started yet.
                  </div>
                </div>
              </div>);
            } else if (typeof value === 'number') {
              let progressValue = parseInt(value*100)
              return (<div key={task} className="">
                <div className="">
                  <span className="lead">
                    <span>
                      <i className={"fa "+(value >= 1.0 ? "fa-check text-success" : "fa-refresh fa-spin fa-fw text-info")} aria-hidden="true"></i>
                    </span>
                    <span>{task}</span>
                  </span>
                  <div className="progress">
                    <div className={"progress-bar progress-bar-striped active "+(progressValue >= 100 ? 'progress-bar-success':'progress-bar-info')} role="progressbar" aria-valuenow={progressValue} aria-valuemin="0" aria-valuemax="100" style={{width: progressValue+'%'}}>
                      {progressValue}%
                    </div>
                  </div>
                </div>
              </div>);
            } else {
              // Maybe an error?
            }
          })}
        </div>
        <hr/>
        <If condition={ !!(this.state.doneTasks && this.state.results) }>
          <Then>
            <div>
              <h1 id="training-results">
                Results for <a href={`https://github.com/${repo.owner}/${repo.name}`} target="_blank">
                  {repo.owner}/{repo.name}
                </a> <small>on {(() => {
                  // let d = new Date(_.get(trainLabels,'date'));
                  // let ds = `${d.toDateString()}, ${d.toTimeString()}`;
                  let ds = _.get(trainLabels,'date');
                  return (<span>{ds}</span>);
                })()}
                </small>
              </h1>
              <p className="lead">This is what we learned by analyzing your Issues!</p>

              <div className="label-results">
                <h2>Labels</h2>
                <If condition={ _.get(trainLabels, 'ok') }>
                  <Then>
                    <div>
                      <p className="lead">
                        We correctly predicted {_.get(trainLabels, 'issues.correct_issues_count')} of {_.get(trainLabels, 'issues.total')} labelled issues,
                        obtaining a score of <strong>{(_.get(trainLabels, 'metrics.score') * 100).toFixed(2)}%</strong>!
                      </p>
                      <div>
                        <p>For those of you interested in more metrics, here is a report!</p>
                        <pre>{_.get(trainLabels, 'metrics.report')}</pre>
                      </div>
                      <div>
                        <p>
                        You may have noticed some missing labels.
                        We are using <a href="http://scikit-learn.org/stable/modules/cross_validation.html" target="_blank">k-fold cross-validation</a> with k={_.get(trainLabels, 'params.k_folds')}.
                        This technique requires that we have at least {_.get(trainLabels, 'params.k_folds')} Issues to support a given label (or class) to train with.
                        </p>
                        <div>
                          The following labels were removed:
                          <ul className="labels-removed">
                            {_.map(_.get(trainLabels, 'labels.remove_labels') || [], (label) => {
                              let count = _.get(trainLabels, 'labels.label_counts.'+label);
                              return (<li key={label}>
                                <span className="label-removed  label label-default">{label}</span> from {count} issue{count > 1 ? 's' : ''}
                              </li>);
                            })}
                          </ul>
                        </div>
                        <p>
                        Note that <span className="label-removed label label-default">duplicate</span>
                        is always removed because it is a label that requires a more complicated approach to detect.
                        We will take more about <span className="label-removed label label-default">duplicate</span> issues later.
                        </p>
                      </div>
                    </div>
                  </Then>
                  <Else>
                    <p className="lead">An error occurred!
                    Please <a href="https://github.com/Glavin001/IssueBot/issues/new" target="_blank">click here to create an issue</a> and
                    be sure to share your repository URL so we can test it, too! Thanks!</p>
                  </Else>
                </If>
              </div>

              <div className="duplicate-results">
                <h2>Duplicates</h2>
                <p className="lead">Found {Object.keys(issueSimilarities).length} similar issues!</p>
                <p>You can open an Issue by double-clicking on a node</p>
                <div className="well">
                  {(() => {
                    let similarIssuesGraph = this.issueSimilaritiesToGraph(repo, issueSimilarities);
                    let width = 500;
                    let height = 500;
                    let charge = -200;
                    let linkDistance = 100;
                    let linkStrength = 0.1;
                    return (<Graph width={width} height={height}
                      charge={charge} linkDistance={linkDistance} linkStrength={linkStrength}
                      nodes={similarIssuesGraph.nodes} links={similarIssuesGraph.links} />);
                  })()}
                </div>
              </div>

              <div className="milestone-results">
                <h2>Milestones</h2>
                <p className="lead">Coming soon!</p>
              </div>

              <div className="assignees-results">
                <h2>Assignees</h2>
                <p className="lead">Coming soon!</p>
              </div>

            </div>
          </Then>
          <Else>
          </Else>
        </If>
      </div>);
  }
}
