const _ = require('lodash');

// Each check function is not the middleware function itself, but rather when
// called it returns a middleware function

const checkLoggedIn = () => {
  return (req, res, next) =>
    req.user ? next() : res.status(401).json({ err: 'User not logged in.' });
};

const checkRequestedUser = (userFieldPath = ['body', 'userId']) => {
  return (req, res, next) => {
    let requestedUserID = req;
    _.each(userFieldPath, step => (requestedUserID = requestedUserID[step]));
    // equality check needs to be '==' instead of '===' because req.user._id is
    // not a string
    const requestedUserLoggedIn =
      requestedUserID && req.user && requestedUserID == req.user._id;
    return requestedUserLoggedIn
      ? next()
      : res.status(401).json({ err: 'User requested not the logged in user.' });
  };
};

const checkRequiredFields = ({ paramsFields = [], bodyFields = [] }) => {
  return (req, res, next) => {
    const hasRequiredParamsField = _.every(
      paramsFields,
      pf => !_.isUndefined(req.params[pf])
    );
    const hasRequiredBodyFields = _.every(
      bodyFields,
      bf => !_.isUndefined(req.body[bf])
    );
    const hasRequiredFields = hasRequiredParamsField && hasRequiredBodyFields;
    return hasRequiredFields
      ? next()
      : res.status(400).json({ err: 'Request missing a required field.' });
  };
};

module.exports = {
  checkLoggedIn,
  checkRequestedUser,
  checkRequiredFields,
};
