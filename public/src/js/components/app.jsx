import React, { Component } from 'react'

export default class App extends Component {

  static childContextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      socket: io('http://issue-manager.ngrok.io')
    };
  }

  getChildContext() {
    return {
      socket: this.state.socket
    };
  }

  render() {
    return (<div className="container">
      {this.props.children}
    </div>);
  }
}
