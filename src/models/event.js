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
  startDatetime: PropTypes.instanceOf(Date).isRequired,
  recurringSchedule: recurringScheduleShape,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
});

/* Methods */

export const makeNewEventDoc = ({ user, suppliedEvent }) => {
  const _id = randomID();
  const userId = user._id;
  const startDatetime = moment()
    .add(2, 'hours')
    .startOf('hour')
    .toDate();
  const event = {
    _id,
    userId,
    title: '',
    startDatetime,
    recurringSchedule: null,
    tags: [],
    ...suppliedEvent,
  };
  return event;
};

export const makeNewEventOccurrenceDoc = ({ event }) => {
  const _id = randomID();
  const occurrence = {
    _id,
    userId: event.userId,
    eventId: event._id,
    datetime: event.startDatetime,
    checkedOff: false,
  };
  return occurrence;
};

const getSingleEventOccurrence = ({ event, timezone }) => {
  const eventMoment = moment(event.startDatetime).tz(timezone);
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
    const numRepeats =
      _.floor(endMoment.diff(eventMoment, everyUnit) / everyX) + 1;
    const scheduledOccurrences = _.times(numRepeats, repeat => {
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

export const getScheduledOccurrences = ({
  event,
  timezone,
  start,
  end,
  now,
}) => {
  const eventOccurrences = event.recurringSchedule
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
  if (event.recurringSchedule) {
    const { everyX, everyUnit } = event.recurringSchedule;
    const eventDatetime = getSingleEventOccurrence({ event, timezone })
      .occurrence.datetime;
    const eventMoment = moment(eventDatetime).tz(timezone);
    const nowMoment = moment(now).tz(timezone);
    const numRepeats =
      _.floor(nowMoment.diff(eventMoment, everyUnit) / everyX) + 1;
    const occurrenceMoment = eventMoment
      .clone()
      .add(numRepeats * everyX, everyUnit);
    const occurrenceDatetime = occurrenceMoment.toDate();
    const occurrence = {
      _id: `${event._id}-${occurrenceMoment.format()}`,
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
