import React from 'react';
import { PropTypes } from 'prop-types';

import _ from 'lodash';
import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import { userShape, getTimezoneFromUser } from 'models/user';

import DayView from 'components/day-view/day-view';
import WeekView from 'components/week-view/week-view';
import MonthView from 'components/month-view/month-view';

import 'stylesheets/components/calendar/calendar.css';

let Calendar = ({ selectedDatetime, loggedInUser, selectedZoom }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const calendarComponent = {
    day: DayView,
    week: WeekView,
    month: MonthView,
  }[selectedZoom];
  const calendar = React.createElement(calendarComponent, { selectedDatetime });
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  return (
    <div className="calendar-container">
      <div>Selected datetime: {selectedMoment.format()}</div>
      {calendar}
    </div>
  );
};

Calendar.propTypes = {
  loggedInUser: userShape.isRequired,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
};

Calendar = _.flow([withUser, withSelectedDatetime, withSelectedZoom])(Calendar);

export default Calendar;
