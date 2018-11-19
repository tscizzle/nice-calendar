import _ from 'lodash';

import { randomID } from 'ui-helpers';

import MOCK_DB from 'mock-data';

/* Helpers */

const jsonHeaders = () => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
};

/* Fetching */

const NICE_SERVER_URL =
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

const nicePOST = (path, body) => {
  return niceFetchJSON(path, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
};

/* API Calls */

const getLoggedInUser = () => {
  const path = '/loggedInUser?' + Math.random(); // the random number avoids the caching of the response
  return niceGET(path);
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
  return niceGET(`/get-events/${userId}`);
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
  return niceGET(`/get-occurrences/${userId}`);
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

/* Mock API */

const getLoggedInUserMock = () => {
  return new Promise(function(resolve, reject) {
    const users = _.find(MOCK_DB, { collection: 'users' });
    const userDocs = users.documents;
    const user = _.find(userDocs, { loggedIn: true });
    const resp = user ? { user } : { message: 'No user is logged in.' };
    resolve(resp);
  });
};

const loginMock = ({ email, password }) => {
  return logout().then(() => {
    const users = _.find(MOCK_DB, { collection: 'users' });
    const userDocs = users.documents;
    const user = _.find(userDocs, { username: email, password });
    let resp;
    if (user) {
      user.loggedIn = true;
      resp = { message: 'Login succeeded.' };
    } else {
      resp = { err: 'No user with that username and password.' };
    }
    return resp;
  });
};

const logoutMock = () => {
  return new Promise(function(resolve, reject) {
    const users = _.find(MOCK_DB, { collection: 'users' });
    const userDocs = users.documents;
    _.each(userDocs, doc => delete doc.loggedIn);
    resolve({ message: 'Logout succeeded.' });
  });
};

const registerMock = ({ email, password }) => {
  return logout().then(() => {
    const users = _.find(MOCK_DB, { collection: 'users' });
    const userDocs = users.documents;
    const user = _.find(userDocs, { username: email });
    let resp;
    if (user) {
      resp = { err: 'User with that username already exists.' };
    } else {
      const newUser = {
        _id: randomID(),
        email,
        username: email,
        password,
        timezone: 'America/New_York',
        loggedIn: true,
      };
      userDocs.push(newUser);
      resp = { message: 'Registration succeeded.' };
    }
    return resp;
  });
};

const initiateResetPasswordMock = () => {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

const resetPasswordMock = ({ token }) => {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

const getEventsMock = ({ userId }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(MOCK_DB, { collection: 'events' });
    const eventDocs = events.documents;
    const userEvents = userId ? _.filter(eventDocs, { userId }) : [];
    const eventMap = _.keyBy(userEvents, '_id');
    resolve({ events: eventMap });
  });
};

const upsertEventMock = ({ event }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(MOCK_DB, { collection: 'events' });
    const eventDocs = events.documents;
    const newEventDocs = _.reject(eventDocs, { _id: event._id });
    const newEvent = { ...event, isDeleted: false };
    newEventDocs.push(newEvent);
    events.documents = newEventDocs;
    resolve();
  });
};

const deleteEventMock = ({ eventId, userId }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(MOCK_DB, { collection: 'events' });
    const eventDocs = events.documents;
    const event = _.find(eventDocs, { _id: eventId, userId });
    if (event) {
      const newEvent = { ...event, isDeleted: true };
      const newEventDocs = _.reject(eventDocs, { _id: eventId });
      newEventDocs.push(newEvent);
      events.documents = newEventDocs;
    }
    resolve();
  });
};

const getOccurrencesMock = ({ userId }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(MOCK_DB, { collection: 'occurrences' });
    const occurrenceDocs = occurrences.documents;
    const userOccurrences = userId ? _.filter(occurrenceDocs, { userId }) : [];
    const occurrenceMap = _.keyBy(userOccurrences, '_id');
    resolve({ occurrences: occurrenceMap });
  });
};

const upsertOccurrenceMock = ({ occurrence }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(MOCK_DB, { collection: 'occurrences' });
    const occurrenceDocs = occurrences.documents;
    const newOccurrenceDocs = _.reject(occurrenceDocs, { _id: occurrence._id });
    const newOccurrence = { ...occurrence, isDeleted: false };
    newOccurrenceDocs.push(newOccurrence);
    occurrences.documents = newOccurrenceDocs;
    resolve();
  });
};

const deleteOccurrenceMock = ({ occurrenceId, userId }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(MOCK_DB, { collection: 'occurrences' });
    const occurrenceDocs = occurrences.documents;
    const occurrence = _.find(occurrenceDocs, { _id: occurrenceId });
    if (occurrence) {
      const newOccurrence = { ...occurrence, isDeleted: true };
      const newOccurrenceDocs = _.reject(occurrenceDocs, { _id: occurrenceId });
      newOccurrenceDocs.push(newOccurrence);
      occurrences.documents = newOccurrenceDocs;
    }
    resolve();
  });
};

export const mockApi = {
  getLoggedInUser: getLoggedInUserMock,
  login: loginMock,
  logout: logoutMock,
  register: registerMock,
  initiateResetPassword: initiateResetPasswordMock,
  resetPassword: resetPasswordMock,
  getEvents: getEventsMock,
  upsertEvent: upsertEventMock,
  deleteEvent: deleteEventMock,
  getOccurrences: getOccurrencesMock,
  upsertOccurrence: upsertOccurrenceMock,
  deleteOccurrence: deleteOccurrenceMock,
};
