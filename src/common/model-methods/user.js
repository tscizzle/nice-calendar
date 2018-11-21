const getTimezoneFromUser = user =>
  user && user.timezone ? user.timezone : 'America/New_York';

module.exports = {
  getTimezoneFromUser,
};
