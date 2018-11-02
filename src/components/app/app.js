import React, { Component } from 'react';
import PropTypes from 'prop-types';

import withUser from 'state-management/state-connectors/with-user';
import { userShape } from 'models/user';

import Topbar from 'components/topbar/topbar';
import Calendar from 'components/calendar/calendar';

import 'stylesheets/components/app/app.css';

class App extends Component {
  static propTypes = {
    loggedInUser: userShape,
    fetchUser: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchUser } = this.props;
    fetchUser();
  }

  render() {
    const { loggedInUser } = this.props;
    return (
      <div className="app">
        <Topbar />
        <div className="content">{loggedInUser && <Calendar />}</div>
      </div>
    );
  }
}

App = withUser(App);

export default App;
