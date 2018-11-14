import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';

import CalendarCell from 'components/calendar-cell/calendar-cell';

import 'stylesheets/components/month-calendar/month-calendar.css';

class MonthCalendar extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    timezone: PropTypes.string.isRequired,
    fetchEvents: PropTypes.func.isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { timezone, selectedDatetime } = this.props;
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const monthStart = selectedMoment.clone().startOf('month');
    const monthEnd = selectedMoment.clone().endOf('month');
    const numWeeks = monthEnd.diff(monthStart, 'weeks') + 1;
    const weeks = _.times(numWeeks, week => {
      const weekContainedMoment = monthStart.clone().add(week, 'weeks');
      const containedDatetime = weekContainedMoment.toDate();
      return (
        <MonthCalendarRow
          containedDatetime={containedDatetime}
          numWeeks={numWeeks}
          key={week}
        />
      );
    });
    return <div className="month-calendar-container">{weeks}</div>;
  }
}

MonthCalendar = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
])(MonthCalendar);

export default MonthCalendar;

let MonthCalendarRow = ({
  containedDatetime,
  numWeeks,
  timezone,
  nowMinute,
}) => {
  const containedMoment = moment(containedDatetime).tz(timezone);
  const weekStart = containedMoment.clone().startOf('week');
  const days = _.times(7, day => {
    const dayContainedMoment = weekStart.clone().add(day, 'days');
    const dayStartMoment = dayContainedMoment.clone().startOf('day');
    const dayEndMoment = dayContainedMoment.clone().endOf('day');
    const dayStartDatetime = dayStartMoment.toDate();
    const dayEndDatetime = dayEndMoment.toDate();
    return (
      <CalendarCell
        startDatetime={dayStartDatetime}
        endDatetime={dayEndDatetime}
        topLeftFormat="D"
        topRightFormat="ddd"
        className="month-calendar-cell"
        key={day}
      />
    );
  });
  const numWeeksClass = `num-weeks-${numWeeks}`;
  const monthCalendarRowClasses = classNames(
    'month-calendar-row',
    numWeeksClass
  );
  return <div className={monthCalendarRowClasses}>{days}</div>;
};

MonthCalendarRow.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  numWeeks: PropTypes.oneOf([4, 5, 6]).isRequired,
  timezone: PropTypes.string.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

MonthCalendarRow = _.flow([withUser, withNowMinute])(MonthCalendarRow);
