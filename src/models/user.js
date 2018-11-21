import PropTypes from 'prop-types';

export const userShape = PropTypes.shape({
  email: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  timezone: PropTypes.string,
});
