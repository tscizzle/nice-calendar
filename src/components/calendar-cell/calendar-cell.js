import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
} from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import CalendarOccurrence from 'components/calendar-occurrence/calendar-occurrence';
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
    const endMoment = moment(endDatetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const isFutureCell = startMoment.isAfter(nowMinuteMoment);
    let datetime;
    if (isFutureCell) {
      datetime = startDatetime;
    } else {
      const candidateEventMoment = nowMinuteMoment
        .clone()
        .add(5, 'minutes')
        .startOf('minute');
      const eventMoment = candidateEventMoment.isAfter(endMoment)
        ? nowMinuteMoment
        : candidateEventMoment;
      datetime = eventMoment.toDate();
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
  startDatetime: PropTypes.instanceOf(Date).isRequired,
  endDatetime: PropTypes.instanceOf(Date).isRequired,
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
