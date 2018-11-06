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
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { loggedInUser, selectedDatetime } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const start = selectedMoment.clone().startOf('month');
    const end = selectedMoment.clone().endOf('month');
    const numWeeks = end.diff(start, 'weeks') + 1;
    const weeks = _.times(numWeeks, week => {
      const containedDatetime = start
        .clone()
        .add(week, 'weeks')
        .toDate();
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

let MonthCalendarRow = ({ containedDatetime, numWeeks, loggedInUser }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const containedMoment = moment(containedDatetime).tz(timezone);
  const start = containedMoment.clone().startOf('week');
  const days = _.times(7, day => {
    const containedDatetime = start
      .clone()
      .add(day, 'days')
      .toDate();
    return (
      <MonthCalendarCell containedDatetime={containedDatetime} key={day} />
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
  loggedInUser: userShape.isRequired,
};

MonthCalendarRow = withUser(MonthCalendarRow);

class MonthCalendarCell extends Component {
  static propTypes = {
    containedDatetime: PropTypes.instanceOf(Date).isRequired,
    loggedInUser: userShape.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    setSelectedDatetime: PropTypes.func.isRequired,
    addingEventFormData: eventShape,
    setAddingEventFormData: PropTypes.func.isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    isHovered: false,
  };

  selectDatetime = () => {
    const { containedDatetime, setSelectedDatetime } = this.props;
    setSelectedDatetime({ datetime: containedDatetime });
  };

  setIsHovered = () => this.setState({ isHovered: true });

  setIsNotHovered = () => this.setState({ isHovered: false });

  openAddingEventForm = () => {
    const {
      containedDatetime,
      loggedInUser,
      addingEventFormData,
      setAddingEventFormData,
    } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const containedMoment = moment(containedDatetime).tz(timezone);
    const startDatetime = containedMoment
      .clone()
      .set({ hours: 12 })
      .toDate();
    const suppliedEvent = {
      ...addingEventFormData,
      startDatetime,
    };
    const event = makeNewEventDoc({ user: loggedInUser, suppliedEvent });
    setAddingEventFormData({ event });
  };

  render() {
    const {
      containedDatetime,
      loggedInUser,
      events,
      occurrences,
      selectedDatetime,
      addingEventFormData,
      nowMinute,
    } = this.props;
    const { isHovered } = this.state;
    const timezone = getTimezoneFromUser(loggedInUser);
    const containedMoment = moment(containedDatetime).tz(timezone);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const isSelectedCell = containedMoment.isSame(selectedMoment);
    let isAddingEventToThisCell = false;
    if (addingEventFormData) {
      const addingToMoment = moment(addingEventFormData.startDatetime).tz(
        timezone
      );
      isAddingEventToThisCell = containedMoment.isSame(addingToMoment, 'day');
    }
    const start = containedMoment
      .clone()
      .startOf('day')
      .toDate();
    const end = containedMoment
      .clone()
      .endOf('day')
      .toDate();
    const dayScheduledOccurrences = [];
    _.each(_.values(events), event => {
      const eventOccurrences = getScheduledOccurrences({
        event,
        timezone,
        start,
        end,
        now: nowMinute,
      });
      dayScheduledOccurrences.push(...eventOccurrences);
    });
    const dayPastOccurrences = [];
    _.each(_.values(occurrences), occurrence => {
      const { eventId, datetime } = occurrence;
      if (start <= datetime && datetime <= end) {
        const event = events[eventId];
        dayPastOccurrences.push({ event, occurrence });
      }
    });
    const addingEventOccurrences = [];
    if (isAddingEventToThisCell) {
      const addingEventOccurrence = makeNewEventOccurrenceDoc({
        event: addingEventFormData,
      });
      addingEventOccurrences.push({
        event: addingEventFormData,
        occurrence: addingEventOccurrence,
        isBeingAdded: true,
      });
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
    const monthCalendarCellClasses = classNames('month-calendar-cell', {
      'month-calendar-selected-cell': isSelectedCell,
    });
    return (
      <div
        className={monthCalendarCellClasses}
        onClick={this.selectDatetime}
        onMouseEnter={this.setIsHovered}
        onMouseLeave={this.setIsNotHovered}
      >
        <div className="month-calendar-cell-top">
          <div className="month-calendar-cell-day-number">
            {containedMoment.format('D')}
          </div>
          <div className="month-calendar-cell-day-name">
            {containedMoment.format('ddd')}
          </div>
        </div>
        <div className="month-calendar-cell-content">{occurrenceDisplays}</div>
        <div className="month-calendar-cell-bottom">
          {isHovered && (
            <div
              className="month-calendar-cell-add-event-button"
              onClick={this.openAddingEventForm}
            >
              <FaPlus />
            </div>
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
  withAddingEventFormData,
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
  const text = event.title || '(Untitled event)';
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
