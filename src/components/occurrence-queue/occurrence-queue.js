import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import api from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';
import { eventShape, getNextScheduledOccurrence } from 'models/event';
import { occurrenceShape, getLatestOccurrences } from 'models/occurrence';

import { CircleButton } from 'components/nice-button/nice-button';
import Divider from 'components/divider/divider';

import 'stylesheets/components/occurrence-queue/occurrence-queue.css';

let OccurrenceQueue = () => {
  return (
    <div className="occurrence-queue">
      <UncheckedOccurrences />
      <Divider />
      <ScheduledOccurrences />
      <Divider />
    </div>
  );
};

export default OccurrenceQueue;

let UncheckedOccurrences = ({ allEvents, occurrences }) => {
  const uncheckedOccurrences = _.pickBy(
    occurrences,
    ({ checkedOff }) => !checkedOff
  );
  const latestUncheckedOccurrences = getLatestOccurrences({
    occurrences: uncheckedOccurrences,
  });
  const uncheckedOccurrencesWithEvents = _.map(
    latestUncheckedOccurrences,
    (occurrence, eventId) => {
      const event = allEvents[eventId];
      return { occurrence, event };
    }
  );
  return (
    <OccurrenceCardsList
      occurrencesWithEvents={uncheckedOccurrencesWithEvents}
      headerText="Unchecked"
      emptyMessage="No Unchecked Occurrences"
    />
  );
};

UncheckedOccurrences.propTypes = {
  allEvents: PropTypes.objectOf(eventShape).isRequired,
  occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
};

UncheckedOccurrences = _.flow([withEvents, withOccurrences])(
  UncheckedOccurrences
);

let ScheduledOccurrences = ({ timezone, events, nowMinute }) => {
  const scheduledOccurrences = [];
  _.each(events, event => {
    const nextScheduledOccurrence = getNextScheduledOccurrence({
      event,
      timezone,
      now: nowMinute,
    });
    if (nextScheduledOccurrence) {
      const { event, occurrence } = nextScheduledOccurrence;
      scheduledOccurrences.push({ event, occurrence, isScheduled: true });
    }
  });
  return (
    <OccurrenceCardsList
      occurrencesWithEvents={scheduledOccurrences}
      headerText="Scheduled"
      emptyMessage="Nothing Scheduled"
    />
  );
};

ScheduledOccurrences.propTypes = {
  timezone: PropTypes.string.isRequired,
  events: PropTypes.objectOf(eventShape).isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

ScheduledOccurrences = _.flow([withUser, withEvents, withNowMinute])(
  ScheduledOccurrences
);

let OccurrenceCardsList = ({
  occurrencesWithEvents,
  headerText,
  emptyMessage,
}) => {
  const sortedOccurrences = _.sortBy(
    occurrencesWithEvents,
    'occurrence.datetime'
  );
  const occurrenceCards = _.map(
    sortedOccurrences,
    ({ event, occurrence, isScheduled }) => (
      <OccurrenceCard
        event={event}
        occurrence={occurrence}
        isScheduled={isScheduled}
        key={occurrence._id}
      />
    )
  );
  const emptyCards = <div className="no-occurrences">{emptyMessage}</div>;
  return (
    <div className="occurrence-cards-list">
      <div className="occurrence-cards-list-top">
        <div className="occurrence-cards-list-header">{headerText}</div>
      </div>
      <div className="occurrence-cards-list-content">
        {!_.isEmpty(occurrenceCards) ? occurrenceCards : emptyCards}
      </div>
    </div>
  );
};

OccurrenceCardsList.propTypes = {
  occurrencesWithEvents: PropTypes.arrayOf(
    PropTypes.shape({
      event: eventShape.isRequired,
      occurrence: occurrenceShape.isRequired,
      isScheduled: PropTypes.bool,
    })
  ).isRequired,
  headerText: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};

let OccurrenceCard = ({
  event,
  occurrence,
  isScheduled,
  loggedInUser,
  timezone,
  fetchOccurrences,
}) => {
  const occurrenceMoment = moment(occurrence.datetime).tz(timezone);
  const occurrenceTimeString = occurrenceMoment.format('MMM D, YYYY HH:mm');
  const occurrenceButtonColor = occurrence.checkedOff ? 'green' : 'red';
  const occurrenceCheckIcon = occurrence.checkedOff ? 'times' : 'check';
  const deleteOccurrence = () => {
    const occurrenceId = occurrence._id;
    api.deleteOccurrence({ occurrenceId }).then(() => {
      fetchOccurrences({ user: loggedInUser });
    });
  };
  const toggleCheckOffOccurrence = () => {
    const newOccurrence = {
      ...occurrence,
      checkedOff: !occurrence.checkedOff,
    };
    api.upsertOccurrence({ occurrence: newOccurrence }).then(() => {
      fetchOccurrences({ user: loggedInUser });
    });
  };
  const occurrenceCardClasses = classNames('occurrence-card', {
    'checked-off': occurrence.checkedOff,
    'is-scheduled': isScheduled,
  });
  return (
    <div className={occurrenceCardClasses}>
      <div className="occurrence-card-top">{event.title}</div>
      <div className="occurrence-card-bottom">
        <div className="occurrence-card-datetime">{occurrenceTimeString}</div>
        {!isScheduled && (
          <div className="occurrence-card-actions">
            <CircleButton
              color={occurrenceButtonColor}
              isSmall={true}
              onClick={deleteOccurrence}
            >
              <FontAwesomeIcon icon="trash" />
            </CircleButton>
            <CircleButton
              color={occurrenceButtonColor}
              isSmall={true}
              onClick={toggleCheckOffOccurrence}
            >
              <FontAwesomeIcon icon={occurrenceCheckIcon} />
            </CircleButton>
          </div>
        )}
      </div>
    </div>
  );
};

OccurrenceCard.propTypes = {
  event: eventShape.isRequired,
  occurrence: occurrenceShape.isRequired,
  isScheduled: PropTypes.bool,
  loggedInUser: userShape.isRequired,
  timezone: PropTypes.string.isRequired,
  fetchOccurrences: PropTypes.func.isRequired,
};

OccurrenceCard = _.flow([withUser, withOccurrences])(OccurrenceCard);
