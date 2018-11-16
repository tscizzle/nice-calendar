import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';

import Topbar from 'components/topbar/topbar';
import CalendarView from 'components/calendar-view/calendar-view';
import AuthView from 'components/auth-view/auth-view';

import 'stylesheets/components/app/app.css';

class App extends Component {
  static propTypes = {
    loggedInUser: userShape,
    fetchUser: PropTypes.func.isRequired,
    updateNowMinute: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchUser, updateNowMinute } = this.props;
    fetchUser();
    const secondsUntilNextMinute = 60 - moment().second() + 1;
    updateNowMinute();
    setTimeout(() => {
      this.minuteSettingIntervalId = setInterval(() => {
        updateNowMinute();
      }, 60 * 1000);
    }, secondsUntilNextMinute * 1000);
  }

  componentWillUnmount() {
    if (this.minuteSettingIntervalId) {
      clearInterval(this.minuteSettingIntervalId);
    }
  }

  render() {
    const { loggedInUser } = this.props;
    return (
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
  }
}

App = _.flow([withUser, withNowMinute])(App);

export default App;
