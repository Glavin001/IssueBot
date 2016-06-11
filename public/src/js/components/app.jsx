import React, { Component } from 'react'

export default class App extends Component {

  static childContextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      socket: io()
    };
  }

  render() {
    return (<div className="container">
      {this.props.children}
    </div>);
  }
}
