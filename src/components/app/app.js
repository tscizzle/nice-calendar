import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';

import Topbar from 'components/topbar/topbar';
import Calendar from 'components/calendar/calendar';

class App extends Component {
  static propTypes = {
    fetchUser: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchUser } = this.props;
    fetchUser();
  }

  state = {
    selectedDatetime: moment().toDate(),
  };

  render() {
    return (
      <div className="app">
        <Topbar />
        <div className="content">
          <Calendar selectedDatetime={this.state.selectedDatetime} />
        </div>
      </div>
    );
  }
}

App = withUser(App);

export default App;
