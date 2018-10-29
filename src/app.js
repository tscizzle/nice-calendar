import React, { Component } from "react";
import { PropTypes } from "prop-types";

import moment from "moment-timezone";

import { userShape } from "./propShapes";
import logo from "./images/calendar.svg";
import "./stylesheets/app.css";

class App extends Component {
  state = {
    loggedInUser: {
      username: "tscizzle",
      timezone: "America/New_York"
    },
    selectedZoom: "month",
    selectedDatetime: moment().toDate()
  };

  render() {
    return (
      <div className="app">
        <Topbar />
        <div className="content">
          <Calendar
            loggedInUser={this.state.loggedInUser}
            selectedZoom={this.state.selectedZoom}
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

const Calendar = ({ loggedInUser, selectedZoom, selectedDatetime }) => {
  const componentMap = {
    day: DayView,
    week: WeekView,
    month: MonthView
  };
  const calendarComponent = componentMap[selectedZoom];
  const calendar = React.createElement(calendarComponent, {
    loggedInUser,
    selectedDatetime
  });
  return <div className="calendar-container">{calendar}</div>;
};

Calendar.propTypes = {
  loggedInUser: userShape,
  selectedZoom: PropTypes.oneOf(["day", "week", "month"]),
  selectedDatetime: PropTypes.instanceOf(Date)
};

const DayView = ({ loggedInUser, selectedDatetime }) => {
  const { timezone } = loggedInUser;
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf("day");
  return <div className="day-view-container">Day View ({start.format()})</div>;
};

DayView.propTypes = {
  loggedInUser: userShape,
  selectedDatetime: PropTypes.instanceOf(Date)
};

const WeekView = ({ loggedInUser, selectedDatetime }) => {
  const { timezone } = loggedInUser;
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf("week");
  return (
    <div className="week-view-container">Week View ({start.format()})</div>
  );
};

WeekView.propTypes = {
  loggedInUser: userShape,
  selectedDatetime: PropTypes.instanceOf(Date)
};

const MonthView = ({ loggedInUser, selectedDatetime }) => {
  const { timezone } = loggedInUser;
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const start = selectedMoment.startOf("month");
  return (
    <div className="month-view-container">Month View ({start.format()})</div>
  );
};

MonthView.propTypes = {
  loggedInUser: userShape,
  selectedDatetime: PropTypes.instanceOf(Date)
};
