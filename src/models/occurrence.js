import { PropTypes } from 'prop-types';

import _ from 'lodash';

/* Schema */

export const occurrenceShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
  checkedOff: PropTypes.bool.isRequired,
});

/* Methods */

export const getLatestPendingOccurrences = ({ occurrences }) => {
  const pendingOccurrences = _.reject(occurrences, 'checkedOff');
  const pendingOccurrencesByEvent = _.groupBy(pendingOccurrences, 'eventId');
  const latestOccurrences = _.mapValues(
    pendingOccurrencesByEvent,
    eventOccurrences => _.maxBy(eventOccurrences, 'timestamp')
  );
  const latestOccurrenceByEvent = _.keyBy(latestOccurrences, 'eventId');
  return latestOccurrenceByEvent;
};
