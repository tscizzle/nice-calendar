import _ from 'lodash';

/* Fetching */

export const NICE_SERVER_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:9000'
    : window.location.origin;

const niceFetch = (...args) => {
  args[0] = NICE_SERVER_URL + args[0];
  args[1] = { credentials: 'include', ...args[1] };
  return fetch(...args);
};

const niceFetchJSON = (...args) => {
  return niceFetch(...args).then(res => res.json());
};

const niceGET = path => {
  return niceFetchJSON(path);
};

const getJSONHeaders = () => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
};

const nicePOST = (path, body) => {
  return niceFetchJSON(path, {
    method: 'POST',
    headers: getJSONHeaders(),
    body: JSON.stringify(body),
  });
};

/* Transforming */

const dateify = ({ obj, dateFieldPaths }) => {
  const newObj = _.cloneDeep(obj);
  _.each(dateFieldPaths, path => {
    const hasField = _.has(obj, path);
    if (hasField) {
      const stringVal = _.get(obj, path);
      const dateVal = new Date(stringVal);
      _.set(newObj, path, dateVal);
    }
  });
  return newObj;
};

/* API Calls */

const getLoggedInUser = () => {
  const path = '/loggedInUser?' + Math.random(); // the random number avoids the caching of the response
  return niceGET(path).then(({ user }) => {
    const processedUser = dateify({
      obj: user,
      dateFieldPaths: ['createdAt', 'updatedAt'],
    });
    return { user: processedUser };
  });
};

const login = ({ email, password }) => {
  return nicePOST('/login', {
    username: email,
    password,
  });
};

const logout = () => {
  return niceGET('/logout');
};

const register = ({ email, password }) => {
  return nicePOST('/register', {
    email,
    username: email,
    password,
  });
};

const initiateResetPassword = ({ email, origin }) => {
  return nicePOST('/initiateResetPassword', {
    email,
    origin,
  });
};

const resetPassword = ({ newPassword, token }) => {
  return nicePOST(`/resetPassword/${token}`, {
    newPassword,
  });
};

const getEvents = ({ userId }) => {
  return niceGET(`/get-events/${userId}`).then(({ events }) => {
    const processedEventMap = _.mapValues(events, event => {
      return dateify({
        obj: event,
        dateFieldPaths: ['datetime', 'stopDatetime', 'createdAt', 'updatedAt'],
      });
    });
    return { events: processedEventMap };
  });
};

const upsertEvent = ({ event }) => {
  return nicePOST('/upsert-event', {
    eventId: event._id,
    userId: event.userId,
    updatedFields: event,
  });
};

const deleteEvent = ({ eventId, userId }) => {
  return nicePOST('/delete-event', {
    eventId,
    userId,
  });
};

const getOccurrences = ({ userId }) => {
  return niceGET(`/get-occurrences/${userId}`).then(({ occurrences }) => {
    const processedOccurrencesMap = _.mapValues(occurrences, event => {
      return dateify({
        obj: event,
        dateFieldPaths: ['datetime', 'createdAt', 'updatedAt'],
      });
    });
    return { occurrences: processedOccurrencesMap };
  });
};

const upsertOccurrence = ({ occurrence }) => {
  return nicePOST('/upsert-occurrence', {
    occurrenceId: occurrence._id,
    userId: occurrence.userId,
    updatedFields: occurrence,
  });
};

const deleteOccurrence = ({ occurrenceId, userId }) => {
  return nicePOST('/delete-occurrence', {
    occurrenceId,
    userId,
  });
};

const api = {
  getLoggedInUser,
  login,
  logout,
  register,
  initiateResetPassword,
  resetPassword,
  getEvents,
  upsertEvent,
  deleteEvent,
  getOccurrences,
  upsertOccurrence,
  deleteOccurrence,
};

export default api;
