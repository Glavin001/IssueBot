import React, { Component } from 'react'

export default class Welcome extends Component {
  render() {
    return (<div>
      <div className="jumbotron">
        <h1>Issue Manager!</h1>
        <p>Your automated Issue organizer.</p>
        <p><a className="btn btn-primary btn-lg" href="/github/login" role="button">Login with GitHub</a></p>
        </div>
      </div>);
  }
}