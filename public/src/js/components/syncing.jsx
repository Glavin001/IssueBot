import React, { Component } from 'react'
import { EVENTS } from '../../../../src/constants';
import { If, Then, Else } from 'react-if';
import _ from 'lodash';

export default class Syncing extends Component {

  static contextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    const { location } = this.props;
    const { query } = location;
    const { repositoryUrl } = query;
    this.state = {
      repositoryUrl,
      tasks: {}
    };
  }

  componentDidMount() {
    console.log('Syncing!');

    this.context.socket.emit(EVENTS.REPOSITORY_SYNC, this.state.repositoryUrl, (err, results) => {
      console.log('sync', err, results);
    });

    this.context.socket.on(EVENTS.REPOSITORY_SYNC_PROGRESS, (data) => {
      console.log('progress', data);
    });

  }

  render() {

    return (<div>
        <h1>Issue Manager</h1>

      </div>);
  }
}
