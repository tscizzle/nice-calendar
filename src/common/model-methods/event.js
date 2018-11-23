const _ = require('lodash');
const moment = require('moment-timezone');

const { getOccurrenceId } = require('./occurrence');
const { randomID } = require('../misc-helpers');

const makeNewEventDoc = ({ user, suppliedEvent }) => {
  const _id = randomID();
  const userId = user._id;
  const datetime = moment()
    .add(2, 'hours')
    .startOf('hour')
    .toDate();
  const event = Object.assign(
    {
      _id,
      userId,
      title: '',
      datetime,
      isRecurring: false,
      recurringSchedule: null,
      tags: [],
    },
    suppliedEvent
  );
  return event;
};

const getSingleEventOccurrence = ({ event }) => {
  const occurrenceId = getOccurrenceId({
    eventId: event._id,
    datetime: event.datetime,
  });
  const occurrence = {
    _id: occurrenceId,
    userId: event.userId,
    eventId: event._id,
    datetime: event.datetime,
    checkedOff: false,
  };
  return { event, occurrence };
};

const getRecurringEventOccurrences = ({ event, timezone, end }) => {
  const { repetitionType } = event.recurringSchedule;
  if (repetitionType === 'everyXUnits') {
    const { everyX, everyUnit } = event.recurringSchedule;
    const eventDatetime = getSingleEventOccurrence({ event }).occurrence
      .datetime;
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
      const occurrenceId = getOccurrenceId({
        eventId: event._id,
        datetime: occurrenceDatetime,
      });
      const occurrence = {
        _id: occurrenceId,
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

const getScheduledOccurrences = ({
  event,
  timezone,
  start,
  end,
  now = new Date('1971-01-01'),
}) => {
  const eventOccurrences = event.isRecurring
    ? getRecurringEventOccurrences({ event, timezone, end })
    : [getSingleEventOccurrence({ event })];
  const boundedStart = _.max([now, start]);
  const eventOccurrencesInWindow = _.filter(
    eventOccurrences,
    ({ occurrence }) =>
      boundedStart <= occurrence.datetime && occurrence.datetime <= end
  );
  return eventOccurrencesInWindow;
};

const getNextScheduledOccurrence = ({ event, timezone, now }) => {
  const nowMoment = moment(now).tz(timezone);
  const eventMoment = moment(event.datetime).tz(timezone);
  if (!eventMoment.isBefore(nowMoment)) {
    const scheduledOccurrence = getSingleEventOccurrence({ event });
    return scheduledOccurrence;
  } else {
    if (event.isRecurring) {
      const eventOccurrences = getRecurringEventOccurrences({
        event,
        timezone,
        end: now,
      });
      const candidateOccurrence = _.last(eventOccurrences);
      let candidateMoment = moment(candidateOccurrence.occurrence.datetime).tz(
        timezone
      );
      if (candidateMoment.isBefore(nowMoment)) {
        const { everyX, everyUnit } = event.recurringSchedule;
        candidateMoment = candidateMoment.clone().add(everyX, everyUnit);
      }
      const occurrenceDatetime = candidateMoment.toDate();
      const occurrenceId = getOccurrenceId({
        eventId: event._id,
        datetime: occurrenceDatetime,
      });
      const occurrence = {
        _id: occurrenceId,
        userId: event.userId,
        eventId: event._id,
        datetime: occurrenceDatetime,
        checkedOff: false,
      };
      return { event, occurrence };
    }
  }
};

module.exports = {
  makeNewEventDoc,
  getScheduledOccurrences,
  getNextScheduledOccurrence,
};
