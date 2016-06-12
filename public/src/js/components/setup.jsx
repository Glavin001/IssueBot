import React, { Component } from 'react';
import { Link } from 'react-router';
import { EVENTS } from '../../../../src/constants';
import { If, Then, Else } from 'react-if';
import _ from 'lodash';

export default class Setup extends Component {

  static contextTypes = {
    socket: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.checkRepositoryURL = this.checkRepositoryURL.bind(this);

    const { location } = this.props;
    const { query } = location;
    const { access_token } = query;
    this.state = {
      token: access_token,
      user: null,
      // repos: [],
      repositoryUrl: '',
      repo: null,
      isValidRepository: false,
    };
  }

  componentDidMount() {
    console.log('Loading!');

    this.context.socket.emit(EVENTS.AUTHENTICATE, this.state.token, (err, user) => {
      console.log(err, user);
      this.setState({
        user
      });
    });

  }

  /**
  Check if repository URL is in valid form
  */
  checkRepositoryURL(event) {
    let value = event.target.value;
    this.setState({
      repositoryUrl: value,
      repo: null,
      isValidRepository: null, // Pending
    });
    this.context.socket.emit(EVENTS.PARSE_REPOSITORY_URL, value, (repo) => {
      // console.log('repo', repo);
      if (repo && repo.name) {
        this.context.socket.emit(EVENTS.GITHUB_REPO, {
          user: repo.owner,
          repo: repo.name
        }, (err, repo) => {
          this.setState({
            repo,
            isValidRepository: !!repo
          });
        });
      } else {
        // Invalid repository
        this.setState({
          repo: null,
          isValidRepository: false
        });
      }
    });
  }

  render() {

    return (<div>
        <h1>Issue Manager</h1>
        <If condition={ typeof this.state.user === 'object' }>
          <Then>{() =>
            <div>
              <div>
                {/*
                <img src={_.get(this.state, 'user.avatar_url')} alt="user avatar" className="img-thumbnail" />
                */}
                <p className="lead">Welcome, <a href={_.get(this.state, 'user.html_url')}>@{_.get(this.state, 'user.login')}</a>!</p>
              </div>
              <div className="input-group input-group-lg">
                <span className="input-group-addon">
                  <If condition={this.state.isValidRepository === null}>
                    <Then>
                      <span>
                        <i className="fa fa-refresh fa-spin fa-fw text-info"></i>
                      </span>
                    </Then>
                    <Else>
                      <span>
                        <i className={"fa "+(this.state.isValidRepository ? "fa-check-circle-o text-success" : "fa-ban text-danger")} aria-hidden="true"></i>
                      </span>
                    </Else>
                  </If>
                </span>
                <input type="text" className="form-control" placeholder="Enter repository URL to sync"
                  value={this.state.repositoryUrl}
                  onChange={this.checkRepositoryURL}/>
                <span className="input-group-btn">
                  <Link to={{ pathname: '/syncing', query: {repositoryUrl: this.state.repositoryUrl} }}
                    className={"btn btn-success "+(this.state.isValidRepository ? '' : 'disabled')} type="button">Sync!</Link>
                </span>
              </div>
              <div>
                <p className="lead">{_.get(this.state, 'repo.description')}</p>
              </div>
            </div>
          }
          </Then>
          <Else>
            <div className="lead">Loading user information</div>
          </Else>
        </If>
      </div>);
  }
}
