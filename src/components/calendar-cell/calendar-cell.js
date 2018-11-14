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
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
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

import 'stylesheets/components/calendar-cell/calendar-cell.css';

class CalendarCell extends Component {
  static propTypes = {
    startDatetime: PropTypes.instanceOf(Date).isRequired,
    endDatetime: PropTypes.instanceOf(Date).isRequired,
    cellHeight: PropTypes.string,
    cellWidth: PropTypes.string,
    topLeftFormat: PropTypes.string,
    topRightFormat: PropTypes.string,
    timezone: PropTypes.string.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    allEvents: PropTypes.objectOf(eventShape).isRequired,
    occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    isHovered: false,
  };

  setIsHovered = () => this.setState({ isHovered: true });

  setIsNotHovered = () => this.setState({ isHovered: false });

  render() {
    const {
      startDatetime,
      endDatetime,
      cellHeight,
      cellWidth,
      topLeftFormat,
      topRightFormat,
      timezone,
      events,
      allEvents,
      occurrences,
      selectedDatetime,
      selectedZoom,
      editingEventFormData,
      nowMinute,
    } = this.props;
    const { isHovered } = this.state;
    const dayScheduledOccurrences = [];
    _.each(_.values(events), event => {
      let eventOccurrences = getScheduledOccurrences({
        event,
        timezone,
        start: startDatetime,
        end: endDatetime,
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
      if (startDatetime <= datetime && datetime <= endDatetime) {
        const event = allEvents[eventId];
        dayPastOccurrences.push({ event, occurrence, hasOccurred: true });
      }
    });
    const dayEditingEventOccurrences = [];
    if (editingEventFormData) {
      const editingEventOccurrences = getScheduledOccurrences({
        event: editingEventFormData,
        timezone,
        start: startDatetime,
        end: endDatetime,
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
        <CalendarOccurrence
          event={event}
          occurrence={occurrence}
          hasOccurred={hasOccurred}
          key={occurrence._id}
        />
      )
    );
    const startMoment = moment(startDatetime).tz(timezone);
    const endMoment = moment(endDatetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const isDayPast = endMoment.isBefore(nowMinuteMoment);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const isInSelectedZoom = startMoment.isSame(selectedMoment, selectedZoom);
    const calendarCellClasses = classNames('calendar-cell', {
      'calendar-cell-not-selected-zoom': !isInSelectedZoom,
    });
    const isNowCell = startDatetime <= nowMinute && nowMinute <= endDatetime;
    const calendarCellDayNumberClasses = classNames(
      'calendar-cell-day-number',
      {
        'calendar-cell-day-number-now': isNowCell,
      }
    );
    const cellStyle = {
      ...(cellHeight ? { height: cellHeight } : {}),
      ...(cellWidth ? { width: cellWidth } : {}),
    };
    return (
      <div
        className={calendarCellClasses}
        onMouseEnter={this.setIsHovered}
        onMouseLeave={this.setIsNotHovered}
        style={cellStyle}
      >
        <div className="calendar-cell-top">
          <div className={calendarCellDayNumberClasses}>
            {topLeftFormat && startMoment.format(topLeftFormat)}
          </div>
          <div className="calendar-cell-day-name">
            {topRightFormat && startMoment.format(topRightFormat)}
          </div>
        </div>
        <div className="calendar-cell-content">{occurrenceDisplays}</div>
        <div className="calendar-cell-bottom">
          {isHovered &&
            !isDayPast && (
              <CalendarCellEditEventButton
                startDatetime={startDatetime}
                endDatetime={endDatetime}
              />
            )}
        </div>
      </div>
    );
  }
}

CalendarCell = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
  withSelectedZoom,
  withEditingEventFormData,
  withNowMinute,
])(CalendarCell);

export default CalendarCell;

class CalendarOccurrence extends Component {
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
    const newDatetime = nextScheduledOccurrence
      ? nextScheduledOccurrence.occurrence.datetime
      : event.datetime;
    const newEvent = {
      ...event,
      datetime: newDatetime,
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
    const calendarOccurrenceClasses = classNames('calendar-occurrence', {
      'being-edited': isBeingEdited,
      'has-occurred': hasOccurred,
      'checked-off': occurrence.checkedOff,
    });
    const calendarOccurrenceDetailsClasses = classNames(
      'calendar-occurrence-details',
      {
        'is-hovered': isHovered,
      }
    );
    const calendarOccurrencePreviewClasses = classNames(
      'calendar-occurrence-preview',
      {
        'is-hovered': isHovered,
      }
    );
    return (
      <div
        className={calendarOccurrenceClasses}
        onClick={this.openEditingEventForm}
        onMouseEnter={this.setIsHovered}
        onMouseLeave={this.setIsNotHovered}
      >
        <div className={calendarOccurrenceDetailsClasses}>
          {hasOccurred ? (
            <div className="calendar-occurrence-actions">
              <FontAwesomeIcon
                icon="trash"
                className="calendar-occurrence-action-button"
                size="sm"
                onClick={this.deleteOccurrence}
              />
              <FontAwesomeIcon
                icon={toggleCheckOffIcon}
                className="calendar-occurrence-action-button"
                size="sm"
                onClick={this.toggleCheckOffOccurrence}
              />
            </div>
          ) : (
            <div />
          )}
          {timeString}
        </div>
        <div className={calendarOccurrencePreviewClasses}>
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

CalendarOccurrence = _.flow([
  withUser,
  withOccurrences,
  withEditingEventFormData,
  withNowMinute,
])(CalendarOccurrence);

let CalendarCellEditEventButton = ({
  startDatetime,
  endDatetime,
  loggedInUser,
  timezone,
  editingEventFormData,
  isEditingExistingEvent,
  setEditingEventFormData,
  nowMinute,
}) => {
  const openEditingEventForm = () => {
    const startMoment = moment(startDatetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const endOfTodayMoment = nowMinuteMoment.clone().endOf('day');
    const isFutureCell = startMoment.isAfter(endOfTodayMoment);
    let datetime;
    if (isFutureCell) {
      datetime = startMoment
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
      datetime = startMoment.toDate();
    }
    const suppliedEvent = {
      ...(isEditingExistingEvent ? {} : editingEventFormData),
      datetime,
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

CalendarCellEditEventButton.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  loggedInUser: userShape.isRequired,
  timezone: PropTypes.string.isRequired,
  editingEventFormData: eventShape,
  isEditingExistingEvent: PropTypes.bool.isRequired,
  setEditingEventFormData: PropTypes.func.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

CalendarCellEditEventButton = _.flow([
  withUser,
  withEditingEventFormData,
  withNowMinute,
])(CalendarCellEditEventButton);
