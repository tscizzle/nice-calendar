import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import api from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withEditingEventFormData from 'state-management/state-connectors/with-editing-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';
import { eventShape } from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import 'components/calendar-occurrence/calendar-occurrence.scss';

const {
  getIsEventBoundedInterval,
  getNextScheduledOccurrence,
} = require('common/model-methods/event');

class CalendarOccurrence extends Component {
  static propTypes = {
    event: eventShape.isRequired,
    occurrence: occurrenceShape.isRequired,
    hasOccurred: PropTypes.bool,
    isFlowHorizontal: PropTypes.bool,
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
    const userId = loggedInUser._id;
    api.deleteOccurrence({ occurrenceId, userId }).then(() => {
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
    api.upsertOccurrence({ occurrence: newOccurrence }).then(() => {
      fetchOccurrences({ user: loggedInUser });
    });
  };

  render() {
    const {
      event,
      occurrence,
      hasOccurred,
      isFlowHorizontal,
      timezone,
      editingEventFormData,
    } = this.props;
    const { isHovered } = this.state;
    const isBeingEdited =
      editingEventFormData && editingEventFormData._id === event._id;
    const text =
      event.title || (isBeingEdited ? '(Adding event…)' : '(Untitled event)');
    const isBoundedInterval = getIsEventBoundedInterval({ event });
    const toggleCheckOffIcon = occurrence.checkedOff ? 'times' : 'check';
    const timeString = moment(occurrence.datetime)
      .tz(timezone)
      .format('HH:mm');
    const calendarOccurrenceClasses = classNames('calendar-occurrence', {
      'checked-off': occurrence.checkedOff,
      'has-occurred': hasOccurred,
      'flow-horizontal': isFlowHorizontal,
      'being-edited': isBeingEdited,
      'is-bounded-interval': isBoundedInterval,
    });
    const calendarOccurrenceDetailsClasses = classNames(
      'calendar-occurrence-details',
      {
        'flow-horizontal': isFlowHorizontal,
        'is-hovered': isHovered,
      }
    );
    const calendarOccurrencePreviewClasses = classNames(
      'calendar-occurrence-preview',
      {
        'flow-horizontal': isFlowHorizontal,
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

export default CalendarOccurrence;
