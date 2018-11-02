import React from 'react';
import { PropTypes } from 'prop-types';

import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import { userShape, getTimezoneFromUser } from 'models/user';

import DayView from 'components/day-view/day-view';
import WeekView from 'components/week-view/week-view';
import MonthView from 'components/month-view/month-view';

import 'stylesheets/components/calendar/calendar.css';

let Calendar = ({ selectedZoom }) => {
  const calendarComponent = {
    day: DayView,
    week: WeekView,
    month: MonthView,
  }[selectedZoom];
  const calendar = React.createElement(calendarComponent);
  return <div className="calendar-container">{calendar}</div>;
};

Calendar.propTypes = {
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
};

Calendar = withSelectedZoom(Calendar);

export default Calendar;
