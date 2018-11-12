import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxMulti from 'redux-multi';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faTimes,
  faCaretDown,
  faAngleLeft,
  faAngleRight,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

import mainReducer from 'state-management/reducers';

import Main from 'components/main/main';

import 'stylesheets/index.css';

// redux

const middlewareEnhancer = applyMiddleware(reduxThunk, reduxMulti);
const enhancer = compose(middlewareEnhancer);

const store = createStore(mainReducer, enhancer);

// fontawesome

library.add(faPlus, faTimes, faCaretDown, faAngleLeft, faAngleRight, faClock);

// mount the site on the DOM

render(<Main store={store} />, document.getElementById('root'));
