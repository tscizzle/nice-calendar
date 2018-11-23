import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import withUser from 'state-management/state-connectors/with-user';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';

import Topbar from 'components/topbar/topbar';
import CalendarView from 'components/calendar-view/calendar-view';
import AuthView from 'components/auth-view/auth-view';
import { FullPageLoading } from 'components/loading/loading';

import 'stylesheets/components/app/app.css';

class App extends Component {
  static propTypes = {
    loggedInUser: userShape,
    hasAttemptedFetchUser: PropTypes.bool.isRequired,
    fetchUser: PropTypes.func.isRequired,
    updateNowMinute: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchUser, updateNowMinute } = this.props;
    fetchUser();

    this.minuteSettingIntervalId = setInterval(updateNowMinute, 1000);
  }

  componentWillUnmount() {
    if (this.minuteSettingIntervalId) {
      clearInterval(this.minuteSettingIntervalId);
    }
  }

  render() {
    const { loggedInUser, hasAttemptedFetchUser } = this.props;
    const app = (
      <div className="app">
        {loggedInUser && <Topbar />}
        {loggedInUser && (
          <div className="content">
            <CalendarView />
          </div>
        )}
        {!loggedInUser && <AuthView />}
      </div>
    );
    const loading = <FullPageLoading />;
    return hasAttemptedFetchUser ? app : loading;
  }
}

App = _.flow([withUser, withNowMinute])(App);

export default App;
