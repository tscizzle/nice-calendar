import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Provider } from 'react-redux';
import { Router, Route, Redirect, withRouter } from 'react-router-dom';

import _ from 'lodash';
import moment from 'moment-timezone';

import history from './history';

import withUser from './stateConnectors/withUser';
import { userShape } from './propShapes';
import { getTimezoneFromUser } from './userHelpers';
import logo from './images/calendar.svg';
import './stylesheets/app.css';

const Main = ({ store }) => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  );
};

export default Main;

class App extends Component {
  static propTypes = {
    loggedInUser: userShape,
    fetchUser: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { fetchUser } = this.props;
    fetchUser();
  }

  state = {
    selectedZoom: 'month',
    selectedDatetime: moment().toDate(),
  };

  setSelectedZoom = ({ selectedZoom }) => {
    this.setState({ selectedZoom });
  };

  render() {
    console.log('state', this.state);
    return (
      <div className="app">
        <Topbar />
        <div className="content">
          <Calendar
            loggedInUser={this.props.loggedInUser}
            selectedZoom={this.state.selectedZoom}
            setSelectedZoomFunc={this.setSelectedZoom}
            selectedDatetime={this.state.selectedDatetime}
          />
        </div>
      </div>
    );
  }
}

App = withUser(App);

const Topbar = () => {
  return (
    <div className="topbar">
      <img className="topbar-logo" src={logo} alt="" />
    </div>
  );
};

const Calendar = ({
  loggedInUser,
  selectedZoom,
  setSelectedZoomFunc,
  selectedDatetime,
}) => {
  const componentMap = {
    day: DayView,
    week: WeekView,
    month: MonthView,
  };
  const calendarComponent = componentMap[selectedZoom];
  const calendar = loggedInUser
    ? React.createElement(calendarComponent, {
        loggedInUser,
        selectedDatetime,
      })
    : null;
  const views = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];
  const onSelectZoom = event => {
    setSelectedZoomFunc({ selectedZoom: event.target.value });
  };
  return (
    <div>
      <select value={selectedZoom} onChange={onSelectZoom}>
        {_.map(views, ({ value, label }) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
      {loggedInUser && <div className="calendar-container">{calendar}</div>}
    </div>
  );
};

Calendar.propTypes = {
  loggedInUser: userShape,
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  setSelectedZoomFunc: PropTypes.func.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};

const DayView = ({ loggedInUser, selectedDatetime }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf('day');
  return <div className="day-view-container">Day View ({start.format()})</div>;
};

DayView.propTypes = {
  loggedInUser: userShape.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};

const WeekView = ({ loggedInUser, selectedDatetime }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf('week');
  return (
    <div className="week-view-container">Week View ({start.format()})</div>
  );
};

WeekView.propTypes = {
  loggedInUser: userShape.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};

const MonthView = ({ loggedInUser, selectedDatetime }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf('month');
  return (
    <div className="month-view-container">Month View ({start.format()})</div>
  );
};

MonthView.propTypes = {
  loggedInUser: userShape.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};
