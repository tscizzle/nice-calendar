const Rollbar = require('rollbar');

let rollbar;
if (process.env.ROLLBAR_POST_SERVER_ITEM) {
  rollbar = new Rollbar(process.env.ROLLBAR_POST_SERVER_ITEM);
} else {
  // rollbar is not available, make a dummy
  rollbar = {
    errorHandler: () => {
      return (err, req, res, next) => next(err);
    },
  };
}

module.exports = rollbar;
