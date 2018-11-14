import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';

import { randomID } from 'ui-helpers';

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
  datetime: PropTypes.instanceOf(Date).isRequired,
  isRecurring: PropTypes.bool.isRequired,
  recurringSchedule: recurringScheduleShape, // required if isRecurring: true
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
});

/* Methods */

export const makeNewEventDoc = ({ user, suppliedEvent }) => {
  const _id = randomID();
  const userId = user._id;
  const datetime = moment()
    .add(2, 'hours')
    .startOf('hour')
    .toDate();
  const event = {
    _id,
    userId,
    title: '',
    datetime,
    isRecurring: false,
    recurringSchedule: null,
    tags: [],
    ...suppliedEvent,
  };
  return event;
};

const getSingleEventOccurrence = ({ event, timezone }) => {
  const eventMoment = moment(event.datetime).tz(timezone);
  const eventDatetime = eventMoment.toDate();
  const occurrence = {
    _id: `${event._id}-${eventMoment.toISOString()}`,
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
    const numRepeats =
      _.floor(endMoment.diff(eventMoment, everyUnit) / everyX) + 1;
    const scheduledOccurrences = _.times(numRepeats, repeat => {
      const occurrenceMoment = eventMoment
        .clone()
        .add(repeat * everyX, everyUnit);
      const occurrenceDatetime = occurrenceMoment.toDate();
      const occurrence = {
        _id: `${event._id}-${occurrenceMoment.toISOString()}`,
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

export const getScheduledOccurrences = ({
  event,
  timezone,
  start,
  end,
  now,
}) => {
  const eventOccurrences = event.isRecurring
    ? getRecurringEventOccurrences({ event, timezone, end })
    : [getSingleEventOccurrence({ event, timezone })];
  const boundedStart = _.max([now, start]);
  const eventOccurrencesInWindow = _.filter(
    eventOccurrences,
    ({ occurrence }) =>
      boundedStart <= occurrence.datetime && occurrence.datetime <= end
  );
  return eventOccurrencesInWindow;
};

export const getNextScheduledOccurrence = ({ event, timezone, now }) => {
  if (event.isRecurring) {
    const { everyX, everyUnit } = event.recurringSchedule;
    const eventDatetime = getSingleEventOccurrence({ event, timezone })
      .occurrence.datetime;
    const eventMoment = moment(eventDatetime).tz(timezone);
    const nowMoment = moment(now).tz(timezone);
    let numRepeats = _.max([
      _.ceil(nowMoment.diff(eventMoment, everyUnit) / everyX),
      0,
    ]);
    // since moment.diff doesn't return the fractional amount, that alone may
    // not tell us enough repeats, so check if it is and add one if needed
    const candidateOccurrenceMoment = eventMoment
      .clone()
      .add(numRepeats * everyX, everyUnit);
    if (candidateOccurrenceMoment.isBefore(nowMoment)) {
      numRepeats += 1;
    }
    const occurrenceMoment = eventMoment
      .clone()
      .add(numRepeats * everyX, everyUnit);
    const occurrenceDatetime = occurrenceMoment.toDate();
    const occurrence = {
      _id: `${event._id}-${occurrenceMoment.toISOString()}`,
      userId: event.userId,
      eventId: event._id,
      datetime: occurrenceDatetime,
      checkedOff: false,
    };
    return { event, occurrence };
  } else {
    const scheduledOccurrence = getSingleEventOccurrence({ event, timezone });
    if (scheduledOccurrence.occurrence.datetime >= now) {
      return scheduledOccurrence;
    }
  }
};
