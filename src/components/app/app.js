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
import { FullPageLoading } from 'components/loading/loading';

import 'components/app/app.scss';

class App extends Component {
  static propTypes = {
    loggedInUser: userShape,
    hasAttemptedFetchUser: PropTypes.bool.isRequired,
    fetchUser: PropTypes.func.isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
    updateNowMinute: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchUser } = this.props;
    fetchUser();

    this.nowMinuteIntervalId = setInterval(() => {
      const { nowMinute, updateNowMinute } = this.props;
      const nowMinuteMoment = moment(nowMinute);
      const newNowMinuteMoment = moment().startOf('minute');
      if (!newNowMinuteMoment.isSame(nowMinuteMoment, 'minute')) {
        updateNowMinute();
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.nowMinuteIntervalId) {
      clearInterval(this.nowMinuteIntervalId);
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
