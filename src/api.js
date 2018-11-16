import _ from 'lodash';

import { randomID } from 'ui-helpers';

import DATABASE from 'test-data';

const getLoggedInUser = () => {
  return new Promise(function(resolve, reject) {
    const users = _.find(DATABASE, { collection: 'users' });
    const userDocs = users.documents;
    const user = _.find(userDocs, { loggedIn: true });
    const resp = user ? { user } : { message: 'No user is logged in.' };
    resolve(resp);
  });
};

const login = ({ email, password }) => {
  return logout().then(() => {
    const users = _.find(DATABASE, { collection: 'users' });
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

const logout = () => {
  return new Promise(function(resolve, reject) {
    const users = _.find(DATABASE, { collection: 'users' });
    const userDocs = users.documents;
    _.each(userDocs, doc => delete doc.loggedIn);
    resolve({ message: 'Logout succeeded.' });
  });
};

const register = ({ email, password }) => {
  return logout().then(() => {
    const users = _.find(DATABASE, { collection: 'users' });
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

const initiateResetPassword = () => {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

const resetPassword = ({ token }) => {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

const getEvents = ({ userId }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(DATABASE, { collection: 'events' });
    const eventDocs = events.documents;
    const userEvents = userId ? _.filter(eventDocs, { userId }) : [];
    const eventMap = _.keyBy(userEvents, '_id');
    resolve({ events: eventMap });
  });
};

const upsertEvent = ({ event }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(DATABASE, { collection: 'events' });
    const eventDocs = events.documents;
    const newEventDocs = _.reject(eventDocs, { _id: event._id });
    const newEvent = { ...event, isDeleted: false };
    newEventDocs.push(newEvent);
    events.documents = newEventDocs;
    resolve();
  });
};

const deleteEvent = ({ eventId }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(DATABASE, { collection: 'events' });
    const eventDocs = events.documents;
    const event = _.find(eventDocs, { _id: eventId });
    if (event) {
      const newEvent = { ...event, isDeleted: true };
      const newEventDocs = _.reject(eventDocs, { _id: eventId });
      newEventDocs.push(newEvent);
      events.documents = newEventDocs;
    }
    resolve();
  });
};

const getOccurrences = ({ userId }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(DATABASE, { collection: 'occurrences' });
    const occurrenceDocs = occurrences.documents;
    const userOccurrences = userId ? _.filter(occurrenceDocs, { userId }) : [];
    const occurrenceMap = _.keyBy(userOccurrences, '_id');
    resolve({ occurrences: occurrenceMap });
  });
};

const upsertOccurrence = ({ occurrence }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(DATABASE, { collection: 'occurrences' });
    const occurrenceDocs = occurrences.documents;
    const newOccurrenceDocs = _.reject(occurrenceDocs, { _id: occurrence._id });
    const newOccurrence = { ...occurrence, isDeleted: false };
    newOccurrenceDocs.push(newOccurrence);
    occurrences.documents = newOccurrenceDocs;
    resolve();
  });
};

const deleteOccurrence = ({ occurrenceId }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(DATABASE, { collection: 'occurrences' });
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

export default {
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
