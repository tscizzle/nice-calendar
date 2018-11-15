import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withShowOccurrenceQueue from 'state-management/state-connectors/with-show-occurrence-queue';

import { CircleButton } from 'components/nice-button/nice-button';

import 'stylesheets/components/occurrence-queue/occurrence-queue.css';

let OccurrenceQueue = ({
  timezone,
  events,
  occurrences,
  setShowOccurrenceQueue,
}) => {
  const closeOccurrenceQueue = () => setShowOccurrenceQueue({ show: false });
  return (
    <div className="occurrence-queue">
      <div className="occurrence-queue-top">
        <div className="occurrence-queue-header">Occurrence Queue</div>
        <CircleButton onClick={closeOccurrenceQueue}>
          <FontAwesomeIcon icon="times" />
        </CircleButton>
      </div>
      <div className="occurrence-queue-content">Unchecked Occurrence List</div>
    </div>
  );
};

OccurrenceQueue.propTypes = {};

OccurrenceQueue = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withShowOccurrenceQueue,
])(OccurrenceQueue);

export default OccurrenceQueue;
