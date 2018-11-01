import _ from 'lodash';

import DATABASE from './testData';

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
