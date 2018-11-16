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
import { userShape } from 'models/user';
import { eventShape } from 'models/event';
import { occurrenceShape, getLatestOccurrences } from 'models/occurrence';

import { CircleButton } from 'components/nice-button/nice-button';

import 'stylesheets/components/occurrence-queue/occurrence-queue.css';

let OccurrenceQueue = ({ timezone, allEvents, occurrences }) => {
  const uncheckedOccurrences = _.pickBy(
    occurrences,
    ({ checkedOff }) => !checkedOff
  );
  const latestUncheckedOccurrences = getLatestOccurrences({
    occurrences: uncheckedOccurrences,
  });
  const sortedOccurrences = _.sortBy(
    _.map(latestUncheckedOccurrences, (occurrence, eventId) => {
      const event = allEvents[eventId];
      return { occurrence, event };
    }),
    'occurrence.datetime'
  );
  const occurrenceQueue = _.map(sortedOccurrences, ({ occurrence, event }) => (
    <OccurrenceQueueOccurence
      event={event}
      occurrence={occurrence}
      key={occurrence._id}
    />
  ));
  return (
    <div className="occurrence-queue">
      <div className="occurrence-queue-top">
        <div className="occurrence-queue-header">Unchecked</div>
      </div>
      <div className="occurrence-queue-content">{occurrenceQueue}</div>
    </div>
  );
};

OccurrenceQueue.propTypes = {
  timezone: PropTypes.string.isRequired,
  allEvents: PropTypes.objectOf(eventShape).isRequired,
  occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
  setShowOccurrenceQueue: PropTypes.func.isRequired,
};

OccurrenceQueue = _.flow([withUser, withEvents, withOccurrences])(
  OccurrenceQueue
);

export default OccurrenceQueue;

let OccurrenceQueueOccurence = ({
  event,
  occurrence,
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
  const occurrenceQueueOccurrencesClasses = classNames(
    'occurrence-queue-occurrence',
    { 'checked-off': occurrence.checkedOff }
  );
  return (
    <div className={occurrenceQueueOccurrencesClasses}>
      <div className="occurrence-queue-occurrence-top">{event.title}</div>
      <div className="occurrence-queue-occurrence-bottom">
        <div className="occurrence-queue-occurrence-datetime">
          {occurrenceTimeString}
        </div>
        <div className="occurrence-queue-occurrence-actions">
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
      </div>
    </div>
  );
};

OccurrenceQueueOccurence.propTypes = {
  event: eventShape.isRequired,
  occurrence: occurrenceShape.isRequired,
  loggedInUser: userShape.isRequired,
  timezone: PropTypes.string.isRequired,
  fetchOccurrences: PropTypes.func.isRequired,
};

OccurrenceQueueOccurence = _.flow([withUser, withOccurrences])(
  OccurrenceQueueOccurence
);
