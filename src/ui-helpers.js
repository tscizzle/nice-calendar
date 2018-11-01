import moment from 'moment-timezone';

export const displayDatetime = ({ datetime, timezone, format }) =>
  moment(datetime)
    .tz(timezone)
    .format(format);
