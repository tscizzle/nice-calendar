import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import { userShape, getTimezoneFromUser } from 'models/user';
import { eventShape, getScheduledOccurrences } from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import 'stylesheets/components/month-view/month-view.css';

class MonthView extends Component {
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
      const containedDatetime = selectedMoment
        .clone()
        .add(week, 'weeks')
        .toDate();
      return (
        <MonthViewRow
          containedDatetime={containedDatetime}
          numWeeks={numWeeks}
          key={week}
        />
      );
    });
    return <div className="month-view-container">{weeks}</div>;
  }
}

MonthView = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
])(MonthView);

export default MonthView;

let MonthViewRow = ({ containedDatetime, numWeeks, loggedInUser }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const containedMoment = moment(containedDatetime).tz(timezone);
  const start = containedMoment.clone().startOf('week');
  const days = _.times(7, day => {
    const containedDatetime = start
      .clone()
      .add(day, 'days')
      .toDate();
    return <MonthViewCell containedDatetime={containedDatetime} key={day} />;
  });
  const numWeeksClass = `num-weeks-${numWeeks}`;
  const monthViewRowClasses = classNames(['month-view-row', numWeeksClass]);
  return <div className={monthViewRowClasses}>{days}</div>;
};

MonthViewRow.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  numWeeks: PropTypes.oneOf([4, 5, 6]).isRequired,
  loggedInUser: userShape.isRequired,
};

MonthViewRow = withUser(MonthViewRow);

let MonthViewCell = ({
  containedDatetime,
  loggedInUser,
  events,
  occurrences,
}) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const containedMoment = moment(containedDatetime).tz(timezone);
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
  const sortedOccurrences = _.sortBy(
    _.concat(dayPastOccurrences, dayScheduledOccurrences),
    'occurrence.datetime'
  );
  const occurrenceDisplays = _.map(
    sortedOccurrences,
    ({ event, occurrence }) => (
      <MonthViewOccurrence
        event={event}
        occurrence={occurrence}
        key={occurrence._id}
      />
    )
  );
  return (
    <div className="month-view-cell">
      <div className="month-view-cell-top">
        <div className="month-view-cell-day-number">
          {containedMoment.format('D')}
        </div>
        <div className="month-view-cell-day-name">
          {containedMoment.format('ddd')}
        </div>
      </div>
      <div className="month-view-cell-content">{occurrenceDisplays}</div>
    </div>
  );
};

MonthViewCell.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  loggedInUser: userShape.isRequired,
  events: PropTypes.objectOf(eventShape).isRequired,
  occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
};

MonthViewCell = _.flow([withUser, withEvents, withOccurrences])(MonthViewCell);

let MonthViewOccurrence = ({ event, occurrence, loggedInUser }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const occurrenceTime = moment(occurrence.datetime)
    .tz(timezone)
    .format('HH:mm');
  return (
    <div className="month-view-occurrence" title={occurrenceTime}>
      <div className="month-view-occurrence-inner">{event.title}</div>
    </div>
  );
};

MonthViewOccurrence.propTypes = {
  event: eventShape.isRequired,
  occurrence: occurrenceShape.isRequired,
};

MonthViewOccurrence = withUser(MonthViewOccurrence);
