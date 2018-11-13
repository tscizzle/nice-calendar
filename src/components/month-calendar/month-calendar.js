import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { upsertOccurrence, deleteOccurrence } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withEditingEventFormData from 'state-management/state-connectors/with-editing-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';
import {
  eventShape,
  makeNewEventDoc,
  getScheduledOccurrences,
  getNextScheduledOccurrence,
} from 'models/event';
import { occurrenceShape } from 'models/occurrence';
import { CircleButton } from 'components/nice-button/nice-button';

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
      const rowKey = weekContainedMoment.format('YYYY-MM-DD');
      return (
        <MonthCalendarRow
          containedDatetime={containedDatetime}
          numWeeks={numWeeks}
          key={rowKey}
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
    const dayContainedDatetime = dayContainedMoment.toDate();
    const cellKey = dayContainedMoment.format('YYYY-MM-DD');
    return (
      <MonthCalendarCell
        containedDatetime={dayContainedDatetime}
        key={cellKey}
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

class MonthCalendarCell extends Component {
  static propTypes = {
    containedDatetime: PropTypes.instanceOf(Date).isRequired,
    timezone: PropTypes.string.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    allEvents: PropTypes.objectOf(eventShape).isRequired,
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
      timezone,
      events,
      allEvents,
      occurrences,
      selectedDatetime,
      editingEventFormData,
      nowMinute,
    } = this.props;
    const { isHovered } = this.state;
    const containedMoment = moment(containedDatetime).tz(timezone);
    const dayStartMoment = containedMoment.clone().startOf('day');
    const dayStart = dayStartMoment.toDate();
    const dayEndMoment = containedMoment.clone().endOf('day');
    const dayEnd = dayEndMoment.toDate();
    const dayScheduledOccurrences = [];
    _.each(_.values(events), event => {
      let eventOccurrences = getScheduledOccurrences({
        event,
        timezone,
        start: dayStart,
        end: dayEnd,
        now: nowMinute,
      });
      if (editingEventFormData) {
        eventOccurrences = _.reject(
          eventOccurrences,
          ({ event }) => event._id === editingEventFormData._id
        );
      }
      dayScheduledOccurrences.push(...eventOccurrences);
    });
    const dayPastOccurrences = [];
    _.each(_.values(occurrences), occurrence => {
      const { eventId, datetime } = occurrence;
      if (dayStart <= datetime && datetime <= dayEnd) {
        const event = allEvents[eventId];
        dayPastOccurrences.push({ event, occurrence, hasOccurred: true });
      }
    });
    const dayEditingEventOccurrences = [];
    if (editingEventFormData) {
      const editingEventOccurrences = getScheduledOccurrences({
        event: editingEventFormData,
        timezone,
        start: dayStart,
        end: dayEnd,
        now: nowMinute,
      });
      dayEditingEventOccurrences.push(...editingEventOccurrences);
    }
    const allOccurrences = _.concat(
      dayPastOccurrences,
      dayScheduledOccurrences,
      dayEditingEventOccurrences
    );
    const sortedOccurrences = _.sortBy(allOccurrences, 'occurrence.datetime');
    const occurrenceDisplays = _.map(
      sortedOccurrences,
      ({ event, occurrence, hasOccurred }) => (
        <MonthCalendarOccurrence
          event={event}
          occurrence={occurrence}
          hasOccurred={hasOccurred}
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
              <MonthCalendarCellEditEventButton
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
  withEditingEventFormData,
  withNowMinute,
])(MonthCalendarCell);

class MonthCalendarOccurrence extends Component {
  static propTypes = {
    event: eventShape.isRequired,
    occurrence: occurrenceShape.isRequired,
    hasOccurred: PropTypes.bool,
    loggedInUser: userShape.isRequired,
    timezone: PropTypes.string.isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
    editingEventFormData: eventShape,
    setEditingEventFormData: PropTypes.func.isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    isHovered: false,
  };

  setIsHovered = () => this.setState({ isHovered: true });

  setIsNotHovered = () => this.setState({ isHovered: false });

  openEditingEventForm = () => {
    const { event, timezone, setEditingEventFormData, nowMinute } = this.props;
    const nextScheduledOccurrence = getNextScheduledOccurrence({
      event,
      timezone,
      now: nowMinute,
    });
    const newStartDatetime = nextScheduledOccurrence
      ? nextScheduledOccurrence.occurrence.datetime
      : event.startDatetime;
    const newEvent = {
      ...event,
      startDatetime: newStartDatetime,
    };
    setEditingEventFormData({ event: newEvent });
  };

  deleteOccurrence = evt => {
    evt.stopPropagation();
    const { occurrence, loggedInUser, fetchOccurrences } = this.props;
    const occurrenceId = occurrence._id;
    deleteOccurrence({ occurrenceId }).then(() => {
      fetchOccurrences({ user: loggedInUser });
    });
  };

  toggleCheckOffOccurrence = evt => {
    evt.stopPropagation();
    const { occurrence, loggedInUser, fetchOccurrences } = this.props;
    const newOccurrence = {
      ...occurrence,
      checkedOff: !occurrence.checkedOff,
    };
    upsertOccurrence({ occurrence: newOccurrence }).then(() => {
      fetchOccurrences({ user: loggedInUser });
    });
  };

  render() {
    const {
      event,
      occurrence,
      hasOccurred,
      timezone,
      editingEventFormData,
    } = this.props;
    const { isHovered } = this.state;
    const isBeingEdited =
      editingEventFormData && editingEventFormData._id === event._id;
    const text =
      event.title || (isBeingEdited ? '(Adding event…)' : '(Untitled event)');
    const toggleCheckOffIcon = occurrence.checkedOff ? 'times' : 'check';
    const timeString = moment(occurrence.datetime)
      .tz(timezone)
      .format('HH:mm');
    const monthCalendarOccurrenceClasses = classNames(
      'month-calendar-occurrence',
      {
        'being-edited': isBeingEdited,
        'has-occurred': hasOccurred,
        'checked-off': occurrence.checkedOff,
      }
    );
    const monthCalendarOccurrenceDetailsClasses = classNames(
      'month-calendar-occurrence-details',
      {
        'is-hovered': isHovered,
      }
    );
    const monthCalendarOccurrencePreviewClasses = classNames(
      'month-calendar-occurrence-preview',
      {
        'is-hovered': isHovered,
      }
    );
    return (
      <div
        className={monthCalendarOccurrenceClasses}
        onClick={this.openEditingEventForm}
        onMouseEnter={this.setIsHovered}
        onMouseLeave={this.setIsNotHovered}
      >
        <div className={monthCalendarOccurrenceDetailsClasses}>
          {hasOccurred ? (
            <div className="month-calendar-occurrence-actions">
              <FontAwesomeIcon
                icon="trash"
                className="month-calendar-occurrence-action-button"
                size="sm"
                onClick={this.deleteOccurrence}
              />
              <FontAwesomeIcon
                icon={toggleCheckOffIcon}
                className="month-calendar-occurrence-action-button"
                size="sm"
                onClick={this.toggleCheckOffOccurrence}
              />
            </div>
          ) : (
            <div />
          )}
          {timeString}
        </div>
        <div className={monthCalendarOccurrencePreviewClasses}>
          {!hasOccurred &&
            event.isRecurring && (
              <FontAwesomeIcon
                icon="clock"
                size="sm"
                className="recurring-occurrence-icon"
              />
            )}
          {text}
        </div>
      </div>
    );
  }
}

MonthCalendarOccurrence = _.flow([
  withUser,
  withOccurrences,
  withEditingEventFormData,
  withNowMinute,
])(MonthCalendarOccurrence);

let MonthCalendarCellEditEventButton = ({
  containedDatetime,
  loggedInUser,
  timezone,
  editingEventFormData,
  isEditingExistingEvent,
  setEditingEventFormData,
  nowMinute,
}) => {
  const openEditingEventForm = () => {
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
      ...(isEditingExistingEvent ? {} : editingEventFormData),
      startDatetime,
    };
    const event = makeNewEventDoc({ user: loggedInUser, suppliedEvent });
    setEditingEventFormData({ event });
  };
  return (
    <CircleButton onClick={openEditingEventForm}>
      <FontAwesomeIcon icon="plus" />
    </CircleButton>
  );
};

MonthCalendarCellEditEventButton.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  loggedInUser: userShape.isRequired,
  timezone: PropTypes.string.isRequired,
  editingEventFormData: eventShape,
  isEditingExistingEvent: PropTypes.bool.isRequired,
  setEditingEventFormData: PropTypes.func.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

MonthCalendarCellEditEventButton = _.flow([
  withUser,
  withEditingEventFormData,
  withNowMinute,
])(MonthCalendarCellEditEventButton);
