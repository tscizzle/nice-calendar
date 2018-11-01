import _ from 'lodash';

import DATABASE from 'test-data';

export const getLoggedInUser = (pretendItWorked = true) => {
  return new Promise(function(resolve, reject) {
    if (pretendItWorked) {
      const users = _.find(DATABASE, { collection: 'users' });
      const userDocs = users.documents;
      const user = _.first(userDocs);
      resolve({ user });
    } else {
      reject(Error('Unable to get logged in user.'));
    }
  });
};

export const getEvents = ({ userId }, pretendItWorked = true) => {
  return new Promise(function(resolve, reject) {
    if (pretendItWorked) {
      const events = _.find(DATABASE, { collection: 'events' });
      const eventDocs = events.documents;
      const userEvents = userId ? _.filter(eventDocs, { userId }) : [];
      resolve({ events: userEvents });
    } else {
      reject(Error(`Unable to get events for user ${userId}.`));
    }
  });
};

export const getOccurrences = ({ userId }, pretendItWorked = true) => {
  return new Promise(function(resolve, reject) {
    if (pretendItWorked) {
      const occurrences = _.find(DATABASE, { collection: 'occurrences' });
      const occurrenceDocs = occurrences.documents;
      const userOccurrences = userId
        ? _.filter(occurrenceDocs, { userId })
        : [];
      console.log('userOccurrences', userOccurrences);
      resolve({ occurrences: userOccurrences });
    } else {
      reject(Error(`Unable to get occurrences for user ${userId}.`));
    }
  });
};
