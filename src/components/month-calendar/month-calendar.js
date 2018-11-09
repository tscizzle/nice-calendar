import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';
import { FaPlus } from 'react-icons/fa';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape, getTimezoneFromUser } from 'models/user';
import {
  eventShape,
  makeNewEventDoc,
  makeNewEventOccurrenceDoc,
  getScheduledOccurrences,
} from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import 'stylesheets/components/month-calendar/month-calendar.css';

class MonthCalendar extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    fetchEvents: PropTypes.func.isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    addingEventFormData: eventShape,
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { loggedInUser, selectedDatetime, addingEventFormData } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const monthStart = selectedMoment.clone().startOf('month');
    const monthEnd = selectedMoment.clone().endOf('month');
    const numWeeks = monthEnd.diff(monthStart, 'weeks') + 1;
    let addingEventOccurrence;
    let addingEventMoment;
    if (addingEventFormData) {
      const occurrence = makeNewEventOccurrenceDoc({
        event: addingEventFormData,
      });
      addingEventOccurrence = {
        event: addingEventFormData,
        occurrence,
        isBeingAdded: true,
      };
      const { datetime } = occurrence;
      addingEventMoment = moment(datetime).tz(timezone);
    }
    const weeks = _.times(numWeeks, week => {
      const containedMoment = monthStart.clone().add(week, 'weeks');
      const containedDatetime = containedMoment.toDate();
      const isAddingEventToThisRow = containedMoment.isSame(
        addingEventMoment,
        'week'
      );
      const addingEventOccurrenceArg = isAddingEventToThisRow
        ? { addingEventOccurrence }
        : {};
      return (
        <MonthCalendarRow
          containedDatetime={containedDatetime}
          numWeeks={numWeeks}
          {...addingEventOccurrenceArg}
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
  withAddingEventFormData,
])(MonthCalendar);

export default MonthCalendar;

let MonthCalendarRow = ({
  containedDatetime,
  numWeeks,
  addingEventOccurrence,
  loggedInUser,
}) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const containedMoment = moment(containedDatetime).tz(timezone);
  const weekStart = containedMoment.clone().startOf('week');
  let addingEventMoment;
  if (addingEventOccurrence) {
    const { datetime } = addingEventOccurrence.occurrence;
    addingEventMoment = moment(datetime).tz(timezone);
  }
  const days = _.times(7, day => {
    const dayContainedMoment = weekStart.clone().add(day, 'days');
    const dayContainedDatetime = dayContainedMoment.toDate();
    const isAddingEventToThisCell = dayContainedMoment.isSame(
      addingEventMoment,
      'day'
    );
    const addingEventOccurrenceArg = isAddingEventToThisCell
      ? { addingEventOccurrence }
      : {};
    return (
      <MonthCalendarCell
        containedDatetime={dayContainedDatetime}
        {...addingEventOccurrenceArg}
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
  addingEventOccurrence: PropTypes.shape({
    event: eventShape.isRequired,
    occurrence: occurrenceShape.isRequired,
    isBeingAdded: PropTypes.oneOf([true]).isRequired,
  }),
  loggedInUser: userShape.isRequired,
};

MonthCalendarRow = withUser(MonthCalendarRow);

class MonthCalendarCell extends Component {
  static propTypes = {
    containedDatetime: PropTypes.instanceOf(Date).isRequired,
    addingEventOccurrence: PropTypes.shape({
      event: eventShape.isRequired,
      occurrence: occurrenceShape.isRequired,
      isBeingAdded: PropTypes.oneOf([true]).isRequired,
    }),
    loggedInUser: userShape.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    isHovered: false,
  };

  setIsHovered = () => this.setState({ isHovered: true });

  setIsNotHovered = () => this.setState({ isHovered: false });

  render() {
    const {
      containedDatetime,
      addingEventOccurrence,
      loggedInUser,
      events,
      occurrences,
      selectedDatetime,
      nowMinute,
    } = this.props;
    const { isHovered } = this.state;
    const timezone = getTimezoneFromUser(loggedInUser);
    const containedMoment = moment(containedDatetime).tz(timezone);
    const dayStartMoment = containedMoment.clone().startOf('day');
    const dayStart = dayStartMoment.toDate();
    const dayEndMoment = containedMoment.clone().endOf('day');
    const dayEnd = dayEndMoment.toDate();
    const dayScheduledOccurrences = [];
    _.each(_.values(events), event => {
      const eventOccurrences = getScheduledOccurrences({
        event,
        timezone,
        start: dayStart,
        end: dayEnd,
        now: nowMinute,
      });
      dayScheduledOccurrences.push(...eventOccurrences);
    });
    const dayPastOccurrences = [];
    _.each(_.values(occurrences), occurrence => {
      const { eventId, datetime } = occurrence;
      if (dayStart <= datetime && datetime <= dayEnd) {
        const event = events[eventId];
        dayPastOccurrences.push({ event, occurrence });
      }
    });
    const addingEventOccurrences = [];
    if (addingEventOccurrence) {
      addingEventOccurrences.push(addingEventOccurrence);
    }
    const allOccurrences = _.concat(
      dayPastOccurrences,
      dayScheduledOccurrences,
      addingEventOccurrences
    );
    const sortedOccurrences = _.sortBy(allOccurrences, 'occurrence.datetime');
    const occurrenceDisplays = _.map(
      sortedOccurrences,
      ({ event, occurrence, isBeingAdded }) => (
        <MonthCalendarOccurrence
          event={event}
          occurrence={occurrence}
          isBeingAdded={isBeingAdded}
          key={occurrence._id}
        />
      )
    );
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const isDayPast = dayEndMoment.isBefore(nowMinuteMoment);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const isInSelectedMonth = containedMoment.isSame(selectedMoment, 'month');
    const monthCalendarCellClasses = classNames('month-calendar-cell', {
      'month-calendar-cell-not-selected-month': !isInSelectedMonth,
    });
    const isTodayCell = containedMoment.isSame(nowMinuteMoment, 'day');
    const monthCalendarCellDayNumberClasses = classNames(
      'month-calendar-cell-day-number',
      {
        'month-calendar-cell-day-number-today': isTodayCell,
      }
    );
    return (
      <div
        className={monthCalendarCellClasses}
        onMouseEnter={this.setIsHovered}
        onMouseLeave={this.setIsNotHovered}
      >
        <div className="month-calendar-cell-top">
          <div className={monthCalendarCellDayNumberClasses}>
            {containedMoment.format('D')}
          </div>
          <div className="month-calendar-cell-day-name">
            {containedMoment.format('ddd')}
          </div>
        </div>
        <div className="month-calendar-cell-content">{occurrenceDisplays}</div>
        <div className="month-calendar-cell-bottom">
          {isHovered &&
            !isDayPast && (
              <MonthCalendarCellAddEventButton
                containedDatetime={containedDatetime}
              />
            )}
        </div>
      </div>
    );
  }
}

MonthCalendarCell = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
  withNowMinute,
])(MonthCalendarCell);

let MonthCalendarOccurrence = ({
  event,
  occurrence,
  isBeingAdded,
  loggedInUser,
}) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const occurrenceTime = moment(occurrence.datetime)
    .tz(timezone)
    .format('HH:mm');
  const text =
    event.title || (isBeingAdded ? '(Adding event…)' : '(Untitled event)');
  const monthCalendarOccurrenceClasses = classNames(
    'month-calendar-occurrence',
    {
      'month-calendar-occurrence-being-added': isBeingAdded,
    }
  );
  return (
    <div className={monthCalendarOccurrenceClasses} title={occurrenceTime}>
      <div className="month-calendar-occurrence-inner">{text}</div>
    </div>
  );
};

MonthCalendarOccurrence.propTypes = {
  event: eventShape.isRequired,
  occurrence: occurrenceShape.isRequired,
  isBeingAdded: PropTypes.bool,
  loggedInUser: userShape.isRequired,
};

MonthCalendarOccurrence = withUser(MonthCalendarOccurrence);

let MonthCalendarCellAddEventButton = ({
  containedDatetime,
  loggedInUser,
  addingEventFormData,
  setAddingEventFormData,
  nowMinute,
}) => {
  const openAddingEventForm = () => {
    const timezone = getTimezoneFromUser(loggedInUser);
    const containedMoment = moment(containedDatetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const endOfTodayMoment = nowMinuteMoment.clone().endOf('day');
    const isFutureDayCell = containedMoment.isAfter(endOfTodayMoment);
    let startDatetime;
    if (isFutureDayCell) {
      startDatetime = containedMoment
        .clone()
        .set({ hours: 12 })
        .toDate();
    } else {
      const candidateStartMoment = nowMinuteMoment
        .clone()
        .add(5, 'minutes')
        .startOf('minute');
      const startMoment = candidateStartMoment.isAfter(endOfTodayMoment)
        ? endOfTodayMoment
        : candidateStartMoment;
      startDatetime = startMoment.toDate();
    }
    const suppliedEvent = {
      ...addingEventFormData,
      startDatetime,
    };
    const event = makeNewEventDoc({ user: loggedInUser, suppliedEvent });
    setAddingEventFormData({ event });
  };
  return (
    <div
      className="month-calendar-cell-add-event-button"
      onClick={openAddingEventForm}
    >
      <FaPlus />
    </div>
  );
};

MonthCalendarCellAddEventButton.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  loggedInUser: userShape.isRequired,
  addingEventFormData: eventShape,
  setAddingEventFormData: PropTypes.func.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

MonthCalendarCellAddEventButton = _.flow([
  withUser,
  withAddingEventFormData,
  withNowMinute,
])(MonthCalendarCellAddEventButton);
