const _ = require('lodash');

const getOccurrenceId = ({ eventId, datetime }) => {
  return `${eventId}-${datetime.toISOString()}`;
};

const getLatestOccurrences = ({ occurrences }) => {
  const pendingOccurrencesByEvent = _.groupBy(_.values(occurrences), 'eventId');
  const latestOccurrences = _.map(
    _.values(pendingOccurrencesByEvent),
    eventOccurrences => _.maxBy(eventOccurrences, 'datetime')
  );
  const latestOccurrenceByEvent = _.keyBy(latestOccurrences, 'eventId');
  return latestOccurrenceByEvent;
};

module.exports = {
  getOccurrenceId,
  getLatestOccurrences,
};
