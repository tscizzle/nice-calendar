import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import _ from 'lodash';
import moment from 'moment-timezone';

import { userShape } from './propShapes';
import { selectedIf } from './uiHelpers';
import logo from './images/calendar.svg';
import './stylesheets/app.css';

import DATABASE from './testData';

class App extends Component {
  state = {
    loggedInUser: {
      username: 'tscizzle',
      timezone: 'America/New_York',
    },
    selectedZoom: 'month',
    selectedDatetime: moment().toDate(),
  };

  setSelectedZoom = ({ selectedZoom }) => {
    this.setState({ selectedZoom });
  };

  render() {
    return (
      <div className="app">
        <Topbar />
        <div className="content">
          <Calendar
            loggedInUser={this.state.loggedInUser}
            selectedZoom={this.state.selectedZoom}
            setSelectedZoomFunc={this.setSelectedZoom}
            selectedDatetime={this.state.selectedDatetime}
          />
        </div>
      </div>
    );
  }
}

export default App;

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
  const calendar = React.createElement(calendarComponent, {
    loggedInUser,
    selectedDatetime,
  });
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
      <select onChange={onSelectZoom}>
        {_.map(views, ({ value, label }) => (
          <option value={value} {...selectedIf(value === selectedZoom)}>
            {label}
          </option>
        ))}
      </select>
      <div className="calendar-container">{calendar}</div>
    </div>
  );
};

Calendar.propTypes = {
  loggedInUser: userShape.isRequired,
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  setSelectedZoomFunc: PropTypes.func.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};

const DayView = ({ loggedInUser, selectedDatetime }) => {
  const { timezone } = loggedInUser;
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf('day');
  return <div className="day-view-container">Day View ({start.format()})</div>;
};

DayView.propTypes = {
  loggedInUser: userShape.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};

const WeekView = ({ loggedInUser, selectedDatetime }) => {
  const { timezone } = loggedInUser;
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
  const { timezone } = loggedInUser;
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
