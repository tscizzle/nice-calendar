import PropTypes from 'prop-types';

/* Schema */

export const userShape = PropTypes.shape({
  email: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  timezone: PropTypes.string,
});

/* Methods */

export const getTimezoneFromUser = user =>
  user && user.timezone ? user.timezone : 'America/New_York';
