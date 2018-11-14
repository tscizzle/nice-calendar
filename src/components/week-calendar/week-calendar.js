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
      return (
        <WeekCalendarColumn
          containedDatetime={dayContainedDatetime}
          key={day}
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
  const DAY_CHUNK_WINDOWS = [
    { startHour: 0, endHour: 6 },
    { startHour: 7, endHour: 15 },
    { startHour: 16, endHour: 23 },
  ];
  const dayChunks = _.map(DAY_CHUNK_WINDOWS, ({ startHour, endHour }) => {
    const startMoment = dayStart.clone().add(startHour, 'hours');
    const endMoment = dayStart
      .clone()
      .add(endHour, 'hours')
      .endOf('hour');
    const startDatetime = startMoment.toDate();
    const endDatetime = endMoment.toDate();
    const cellHeight =
      startHour === 0 ? 'calc(100% / 5)' : 'calc(100% * 2 / 5)';
    return (
      <CalendarCell
        startDatetime={startDatetime}
        endDatetime={endDatetime}
        cellHeight={cellHeight}
        topLeftFormat="HH:mm"
        key={startHour}
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
