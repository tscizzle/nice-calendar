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
