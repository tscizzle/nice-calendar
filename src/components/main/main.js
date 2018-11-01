import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import history from 'state-management/history';

import App from 'components/app/app';

const Main = ({ store }) => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  );
};

export default Main;
