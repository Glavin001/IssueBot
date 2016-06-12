import React, { Component } from 'react'
import { EVENTS, REPOSITORY_SYNC_TASKS } from '../../../../src/constants';
import { If, Then, Else } from 'react-if';
import _ from 'lodash';

export default class Syncing extends Component {

  static contextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.syncRepo = this.syncRepo.bind(this);

    const { location } = this.props;
    const { query } = location;
    const { repositoryUrl } = query;
    this.state = {
      repositoryUrl,
    };
  }

  componentDidMount() {
    console.log('Syncing!');
    this.resetTasks();

    this.context.socket.on(EVENTS.REPOSITORY_SYNC_PROGRESS, (data) => {
      console.log('progress', data);

      let {tasks} = this.state;
      tasks[data.task] = data.percent;
      this.setState({tasks});

    });

    this.syncRepo();

  }

  resetTasks() {
    let tasks = _.chain(REPOSITORY_SYNC_TASKS).values().map((t) => [t,0]).fromPairs().value();
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
        doneTasks: true
      })
    });

  }

  render() {

    return (<div>
        <h1>Issue Manager</h1>
        <button className="btn btn-primary" onClick={this.syncRepo}>Sync</button>
        <hr/>
        <div>
          {_.map(this.state.tasks, (percent, task) => {
            let progressValue = parseInt(percent*100)
            return (<div key={task} className="">
              <div className="">
                <span className="lead">
                  <span>
                    <i className={"fa "+(percent >= 1.0 ? "fa-check text-success" : "fa-refresh fa-spin fa-fw text-info")} aria-hidden="true"></i>
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
          })}
        </div>
        <hr/>
        <If condition={ this.state.doneTasks }>
          <Then>
            <div>DONE!</div>
          </Then>
        </If>
      </div>);
  }
}
