import _ from 'lodash';

import { randomID } from 'common/misc-helpers';

const MOCK_DB = [
  {
    collection: 'users',
    documents: [
      {
        _id: 'u_0',
        email: 'u_0@nicecalendar.com',
        username: 'u_0@nicecalendar.com',
        password: 'u_0',
        timezone: 'America/New_York',
        loggedIn: true,
      },
      {
        _id: 'u_1',
        email: 'u_1@nicecalendar.com',
        username: 'u_1@nicecalendar.com',
        password: 'u_1',
        timezone: 'America/Los_Angeles',
      },
    ],
  },
  {
    collection: 'events',
    documents: [
      {
        _id: 'e_0',
        userId: 'u_0',
        title: 'Important meeting',
        datetime: new Date('2018-11-20T13:24:00Z'),
        isRecurring: false,
        recurringSchedule: null,
      },
      {
        _id: 'e_1',
        userId: 'u_0',
        title: 'Bi-Weekly jousting sesh long long title',
        datetime: new Date('2018-10-15T08:10:00Z'),
        isRecurring: true,
        recurringSchedule: {
          repetitionType: 'everyXUnits',
          everyX: 2,
          everyUnit: 'week',
        },
      },
    ],
  },
  {
    collection: 'occurrences',
    documents: [
      {
        _id: 'o_0',
        userId: 'u_0',
        eventId: 'e_0',
        datetime: new Date('2018-11-10T13:24:00Z'),
        checkedOff: false,
      },
      {
        _id: 'o_1',
        userId: 'u_0',
        eventId: 'e_1',
        datetime: new Date('2018-11-05T08:10:00Z'),
        checkedOff: true,
      },
      {
        _id: 'o_2',
        userId: 'u_0',
        eventId: 'e_1',
        datetime: new Date('2018-11-06T08:10:00Z'),
        checkedOff: false,
      },
      {
        _id: 'o_2',
        userId: 'u_0',
        eventId: 'e_1',
        datetime: new Date('2018-11-07T08:10:00Z'),
        checkedOff: false,
      },
    ],
  },
];

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
  return logoutMock().then(() => {
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
  return logoutMock().then(() => {
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
