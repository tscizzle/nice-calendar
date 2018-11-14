import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import { userShape } from 'models/user';
import { eventShape } from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import CalendarCell from 'components/calendar-cell/calendar-cell';

import 'stylesheets/components/week-calendar/week-calendar.css';

const DAY_CHUNK_WINDOWS = [
  { start: 0, end: 6 },
  { start: 7, end: 15 },
  { start: 16, end: 23 },
];

class WeekCalendar extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    timezone: PropTypes.string.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
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
    const weekStart = selectedMoment.clone().startOf('week');
    const days = _.times(7, day => {
      const dayContainedMoment = weekStart.clone().add(day, 'days');
      const dayContainedDatetime = dayContainedMoment.toDate();
      const cellKey = dayContainedMoment.format('YYYY-MM-DD');
      return (
        <WeekCalendarColumn
          containedDatetime={dayContainedDatetime}
          key={cellKey}
        />
      );
    });
    return <div className="week-calendar-container">{days}</div>;
  }
}

WeekCalendar = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
])(WeekCalendar);

export default WeekCalendar;

let WeekCalendarColumn = ({ containedDatetime, timezone }) => {
  const containedMoment = moment(containedDatetime).tz(timezone);
  const dayStart = containedMoment.clone().startOf('day');
  const dayChunks = _.map(DAY_CHUNK_WINDOWS, ({ start, end }) => {
    const startMoment = dayStart.clone().add(start, 'hours');
    const endMoment = dayStart
      .clone()
      .add(end, 'hours')
      .endOf('hour');
    const startDatetime = startMoment.toDate();
    const endDatetime = endMoment.toDate();
    const cellHeight = start === 0 ? 'calc(100% / 4)' : 'calc(100% * 3 / 8)';
    const startTimeString = startMoment.format('HH');
    return (
      <CalendarCell
        startDatetime={startDatetime}
        endDatetime={endDatetime}
        cellHeight={cellHeight}
        topLeftFormat="HH:mm"
        key={startTimeString}
      />
    );
  });
  return (
    <div className="week-calendar-column">
      <div className="week-calendar-column-top">
        <div className="week-calendar-column-day-number">
          {containedMoment.format('D')}
        </div>
        <div className="week-calendar-column-day-name">
          {containedMoment.format('ddd')}
        </div>
      </div>
      <div className="week-calendar-column-content">{dayChunks}</div>
    </div>
  );
};

WeekCalendarColumn.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  timezone: PropTypes.string.isRequired,
};

WeekCalendarColumn = withUser(WeekCalendarColumn);
