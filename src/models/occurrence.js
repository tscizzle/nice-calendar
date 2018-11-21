import PropTypes from 'prop-types';

export const occurrenceShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  datetime: PropTypes.instanceOf(Date).isRequired,
  checkedOff: PropTypes.bool.isRequired,
  isDeleted: PropTypes.bool,
  createdAt: PropTypes.instanceOf(Date),
  updatedAt: PropTypes.instanceOf(Date),
});
