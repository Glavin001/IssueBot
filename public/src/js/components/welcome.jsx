import React, { Component } from 'react'

export default class Welcome extends Component {
  render() {
    return (<div className="welcome">
      <div className="jumbotron">
        <h1>Issue Manager!</h1>
        <p>Your automated Issue organizer and assistant.</p>
        <p><a className="btn btn-primary btn-lg" href="http://issue-manager.ngrok.io/github/login" role="button">Login with GitHub <i className="fa fa-github" aria-hidden="true"></i></a></p>
        </div>
      </div>);
  }
}