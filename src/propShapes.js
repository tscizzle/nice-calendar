import { PropTypes } from 'prop-types';

export const userShape = PropTypes.shape({
  username: PropTypes.string,
  timezone: PropTypes.string,
});
