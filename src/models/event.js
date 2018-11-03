import PropTypes from 'prop-types';

import _ from 'lodash';
import moment from 'moment-timezone';

/* Schema */

const recurringScheduleShape = PropTypes.shape({
  repetitionType: PropTypes.oneOf(['everyXUnits']).isRequired,
  everyX: PropTypes.number,
  everyUnit: PropTypes.oneOf(['day', 'week', 'month', 'year']),
});

export const eventShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  timeOfDay: PropTypes.instanceOf(Date).isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  recurringSchedule: recurringScheduleShape,
});

/* Methods */

const getSingleEventOccurrence = ({ event, timezone }) => {
  const eventTimeMoment = moment(event.timeOfDay).tz(timezone);
  const eventMoment = moment(event.startDate)
    .tz(timezone)
    .set({
      hour: eventTimeMoment.get('hour'),
      minute: eventTimeMoment.get('minute'),
    });
  const eventDatetime = eventMoment.toDate();
  const occurrence = {
    _id: `${event._id}-${eventMoment.format()}`,
    userId: event.userId,
    eventId: event._id,
    datetime: eventDatetime,
    checkedOff: false,
  };
  return { event, occurrence };
};

const getRecurringEventOccurrences = ({ event, timezone, end }) => {
  const { repetitionType } = event.recurringSchedule;
  if (repetitionType === 'everyXUnits') {
    const { everyX, everyUnit } = event.recurringSchedule;
    const eventDatetime = getSingleEventOccurrence({ event, timezone })
      .occurrence.datetime;
    const eventMoment = moment(eventDatetime).tz(timezone);
    const endMoment = moment(end).tz(timezone);
    if (eventMoment.isAfter(endMoment)) {
      return [];
    }
    const numRepeats = _.floor(endMoment.diff(eventMoment, everyUnit) / everyX);
    const scheduledOccurrences = _.times(numRepeats + 1, repeat => {
      const occurrenceMoment = eventMoment
        .clone()
        .add(repeat * everyX, everyUnit);
      const occurrenceDatetime = occurrenceMoment.toDate();
      const occurrence = {
        _id: `${event._id}-${occurrenceMoment.format()}`,
        userId: event.userId,
        eventId: event._id,
        datetime: occurrenceDatetime,
        checkedOff: false,
      };
      return { event, occurrence };
    });
    return scheduledOccurrences;
  }
};

export const getScheduledOccurrences = ({ event, timezone, start, end }) => {
  const eventOccurrences = event.recurringSchedule
    ? getRecurringEventOccurrences({ event, timezone, end })
    : [getSingleEventOccurrence({ event, timezone })];
  const now = new Date();
  const boundedStart = _.max([now, start]);
  const eventOccurrencesInWindow = _.filter(
    eventOccurrences,
    ({ occurrence }) =>
      boundedStart <= occurrence.datetime && occurrence.datetime <= end
  );
  return eventOccurrencesInWindow;
};
