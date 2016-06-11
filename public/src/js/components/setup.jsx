import React, { Component } from 'react'

export default class Setup extends Component {

  static contextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    const { location } = this.props;
    const { query } = location;
    const { access_token } = query;
    this.state = {
      token: access_token,
      user: null,
      repos: [],
    };
  }

  componentDidMount() {
    console.log('Loading!');

    this.context.socket.emit('/user', this.state.token, (err, user) => {
      console.log(err, user);
      this.setState({
        user
      });
    });

    // this.context.socket.emit('/user/repos', this.state.token, (err, repos) => {
    //   console.log(err, repos);
    //   this.setState({
    //     repos
    //   });
    // });

  }

  render() {

    return (<div>
        <h1>Issue Manager</h1>
        <div>{this.state.access_token}</div>
        {JSON.stringify(this.state.user || {})}
        {this.state.repos.map((repo, i) => {
          return <div key={i}>{repo.full_name}</div>
        })}
      </div>);
  }
}
