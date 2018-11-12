import _ from 'lodash';

import DATABASE from 'test-data';

export const getLoggedInUser = () => {
  return new Promise(function(resolve, reject) {
    const users = _.find(DATABASE, { collection: 'users' });
    const userDocs = users.documents;
    const user = _.first(userDocs);
    resolve({ user });
  });
};

export const getEvents = ({ userId }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(DATABASE, { collection: 'events' });
    const eventDocs = events.documents;
    const userEvents = userId ? _.filter(eventDocs, { userId }) : [];
    const eventMap = _.keyBy(userEvents, '_id');
    resolve({ events: eventMap });
  });
};

export const upsertEvent = ({ event }) => {
  return new Promise(function(resolve, reject) {
    const events = _.find(DATABASE, { collection: 'events' });
    const eventDocs = events.documents;
    const newEventDocs = _.reject(eventDocs, { _id: event._id });
    newEventDocs.push(event);
    events.documents = newEventDocs;
    resolve();
  });
};

export const getOccurrences = ({ userId }) => {
  return new Promise(function(resolve, reject) {
    const occurrences = _.find(DATABASE, { collection: 'occurrences' });
    const occurrenceDocs = occurrences.documents;
    const userOccurrences = userId ? _.filter(occurrenceDocs, { userId }) : [];
    const occurrenceMap = _.keyBy(userOccurrences, '_id');
    resolve({ occurrences: occurrenceMap });
  });
};
