import _ from 'lodash';

import DATABASE from 'test-data';

const getLoggedInUser = () => {
  return new Promise(function(resolve, reject) {
    const users = _.find(DATABASE, { collection: 'users' });
    const userDocs = users.documents;
    const user = _.first(userDocs);
    resolve({ user });
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
  getEvents,
  upsertEvent,
  deleteEvent,
  getOccurrences,
  upsertOccurrence,
  deleteOccurrence,
};
