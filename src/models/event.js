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

const getRecurringEventDatetimes = ({ event, timezone, start, end }) => {
  return ['not', 'implemented', 'yet'];
};

const getSingleEventDatetime = ({ event, timezone, start, end }) => {
  const now = new Date();
  const boundedStart = _.max([now, start]);
  const eventTimeMoment = moment(event.timeOfDay).tz(timezone);
  const eventMoment = moment(event.startDate)
    .tz(timezone)
    .set({
      hour: eventTimeMoment.get('hour'),
      minute: eventTimeMoment.get('minute'),
    });
  const eventDatetime = eventMoment.toDate();
  const eventIsInBounds = boundedStart <= eventDatetime && eventDatetime <= end;
  const scheduledDatetimes = eventIsInBounds ? [eventDatetime] : [];
  return scheduledDatetimes;
};

export const getScheduledDatetimes = ({ event, timezone, start, end }) => {
  return event.recurringSchedule
    ? getRecurringEventDatetimes({ event, timezone, start, end })
    : getSingleEventDatetime({ event, timezone, start, end });
};
