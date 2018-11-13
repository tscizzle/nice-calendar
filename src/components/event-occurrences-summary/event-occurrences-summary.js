import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { upsertOccurrence, deleteOccurrence } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withEditingEventFormData from 'state-management/state-connectors/with-editing-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape, getTimezoneFromUser } from 'models/user';
import { eventShape, getNextScheduledOccurrence } from 'models/event';
import { occurrenceShape, getLatestOccurrences } from 'models/occurrence';
import { CircleButton } from 'components/nice-button/nice-button';

import 'stylesheets/components/event-occurrences-summary/event-occurrences-summary.css';

let EventOccurrencesSummary = ({
  loggedInUser,
  timezone,
  events,
  occurrences,
  fetchOccurrences,
  editingEventFormData,
  setEditingEventFormData,
  nowMinute,
}) => {
  const eventId = editingEventFormData._id;
  const latestOccurrenceByEvent = getLatestOccurrences({ occurrences });
  const latestOccurrence = latestOccurrenceByEvent[eventId];
  let latestOccurrenceMoment,
    isCheckedOff,
    checkOffOccurrence,
    deleteLatestOccurrence;
  if (latestOccurrence) {
    latestOccurrenceMoment = moment(latestOccurrence.datetime).tz(timezone);
    isCheckedOff = latestOccurrence.checkedOff;
    checkOffOccurrence = () => {
      const checkedOffOccurrence = { ...latestOccurrence, checkedOff: true };
      upsertOccurrence({ occurrence: checkedOffOccurrence }).then(() => {
        setEditingEventFormData({ event: null });
        fetchOccurrences({ user: loggedInUser });
      });
    };
    deleteLatestOccurrence = () => {
      const occurrenceId = latestOccurrence._id;
      deleteOccurrence({ occurrenceId }).then(() => {
        setEditingEventFormData({ event: null });
        fetchOccurrences({ user: loggedInUser });
      });
    };
  }
  const nextSheduledOccurrence = getNextScheduledOccurrence({
    event: editingEventFormData,
    timezone,
    now: nowMinute,
  });
  let nextOccurrenceMoment;
  if (nextSheduledOccurrence) {
    const { occurrence: nextOccurrence } = nextSheduledOccurrence;
    nextOccurrenceMoment = moment(nextOccurrence.datetime).tz(timezone);
  }
  const occurrenceDatetimeFormat = 'MMM DD, YYYY HH:mm';
  const latestOccurrenceButtonColor = isCheckedOff ? 'green' : 'red';
  const latestOccurrenceClasses = classNames(
    'event-occurrence',
    'latest-occurrence',
    {
      'checked-off': isCheckedOff,
    }
  );
  const nextOccurrenceClasses = classNames(
    'event-occurrence',
    'next-occurrence'
  );
  return (
    <div className="event-occurrences-summary">
      <div className="event-occurrences-summary-header">Latest Occurrence</div>
      <div className="event-occurrences-summary-content">
        {latestOccurrenceMoment ? (
          <div className={latestOccurrenceClasses}>
            {latestOccurrenceMoment.format(occurrenceDatetimeFormat)}
            <div className="event-occurrence-actions">
              <CircleButton
                color={latestOccurrenceButtonColor}
                isSmall={true}
                onClick={deleteLatestOccurrence}
              >
                <FontAwesomeIcon icon="trash" />
              </CircleButton>
              {!isCheckedOff && (
                <CircleButton
                  color={latestOccurrenceButtonColor}
                  isSmall={true}
                  onClick={checkOffOccurrence}
                >
                  <FontAwesomeIcon icon="check" />
                </CircleButton>
              )}
            </div>
          </div>
        ) : (
          <div className="no-occurrences">No Past Occurrences</div>
        )}
      </div>
      <div className="event-occurrences-summary-header">Next Occurrence</div>
      <div className="event-occurrences-summary-content">
        {nextOccurrenceMoment ? (
          <div className={nextOccurrenceClasses}>
            {nextOccurrenceMoment.format(occurrenceDatetimeFormat)}
          </div>
        ) : (
          <div className="no-occurrences">No Occurrence Scheduled</div>
        )}
      </div>
    </div>
  );
};

EventOccurrencesSummary.propTypes = {
  loggedInUser: userShape.isRequired,
  events: PropTypes.objectOf(eventShape).isRequired,
  occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
  fetchOccurrences: PropTypes.func.isRequired,
  editingEventFormData: PropTypes.object.isRequired,
  setEditingEventFormData: PropTypes.func.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

EventOccurrencesSummary = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withEditingEventFormData,
  withNowMinute,
])(EventOccurrencesSummary);

export default EventOccurrencesSummary;
