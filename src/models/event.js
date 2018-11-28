import PropTypes from 'prop-types';

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
  isStopping: PropTypes.bool,
  stopDatetime: PropTypes.instanceOf(Date),
  notes: PropTypes.string,
  isDeleted: PropTypes.bool,
  createdAt: PropTypes.instanceOf(Date),
  updatedAt: PropTypes.instanceOf(Date),
});
