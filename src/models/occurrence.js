import PropTypes from 'prop-types';
import _ from 'lodash';

/* Schema */

export const occurrenceShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  datetime: PropTypes.instanceOf(Date).isRequired,
  checkedOff: PropTypes.bool.isRequired,
  isDeleted: PropTypes.bool,
});

/* Methods */

export const getLatestOccurrences = ({ occurrences }) => {
  const pendingOccurrencesByEvent = _.groupBy(_.values(occurrences), 'eventId');
  const latestOccurrences = _.map(
    _.values(pendingOccurrencesByEvent),
    eventOccurrences => _.maxBy(eventOccurrences, 'datetime')
  );
  const latestOccurrenceByEvent = _.keyBy(latestOccurrences, 'eventId');
  return latestOccurrenceByEvent;
};
