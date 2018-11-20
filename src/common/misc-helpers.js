/* Shared code between server and client */

const _ = require('lodash');

const randomID = () =>
  _.times(2, () =>
    Math.random()
      .toString(36)
      .substr(2, 10)
  ).join('');

module.exports = {
  randomID,
};
