const moment = require("moment-timezone");

const getTimezoneFromUser = (user) =>
  user && user.timezone ? user.timezone : moment.tz.guess();

module.exports = {
  getTimezoneFromUser,
};
