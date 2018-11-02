import { PropTypes } from 'prop-types';

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

const getSingleEventDatetime = ({ event, timezone }) => {
  const eventTimeMoment = moment(event.timeOfDay).tz(timezone);
  const eventMoment = moment(event.startDate)
    .tz(timezone)
    .set({
      hour: eventTimeMoment.get('hour'),
      minute: eventTimeMoment.get('minute'),
    });
  const eventDatetime = eventMoment.toDate();
  return eventDatetime;
};

const getRecurringEventDatetimes = ({ event, timezone, end }) => {
  const { repetitionType } = event.recurringSchedule;
  if (repetitionType === 'everyXUnits') {
    const { everyX, everyUnit } = event.recurringSchedule;
    const eventDatetime = getSingleEventDatetime({ event, timezone });
    const eventMoment = moment(eventDatetime).tz(timezone);
    const endMoment = moment(end).tz(timezone);
    if (eventMoment.isAfter(endMoment)) {
      return [];
    }
    const numRepeats = _.floor(endMoment.diff(eventMoment, everyUnit) / everyX);
    const scheduledDatetimes = _.times(numRepeats + 1, repeat => {
      const occurrenceDatetime = eventMoment
        .clone()
        .add(repeat * everyX, everyUnit)
        .toDate();
      return occurrenceDatetime;
    });
    return scheduledDatetimes;
  }
};

export const getScheduledDatetimes = ({ event, timezone, start, end }) => {
  const eventDatetimes = event.recurringSchedule
    ? getRecurringEventDatetimes({ event, timezone, end })
    : [getSingleEventDatetime({ event, timezone })];
  const now = new Date();
  const boundedStart = _.max([now, start]);
  const eventDatetimesInWindow = _.filter(
    eventDatetimes,
    dt => boundedStart <= dt && dt <= end
  );
  return eventDatetimesInWindow;
};
