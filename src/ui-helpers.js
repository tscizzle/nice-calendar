import _ from 'lodash';
import moment from 'moment-timezone';

export const displayDatetime = ({ datetime, timezone, format }) =>
  moment(datetime)
    .tz(timezone)
    .format(format);

export const randomID = () =>
  _.times(2, () =>
    Math.random()
      .toString(36)
      .substr(2, 10)
  ).join('');
