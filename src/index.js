import React from 'react';
import { render } from 'react-dom';

import './stylesheets/index.css';

import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxMulti from 'redux-multi';

import mainReducer from './reducers';

import Main from './app';

// redux

const middlewareEnhancer = applyMiddleware(reduxThunk, reduxMulti);
const enhancer = compose(middlewareEnhancer);

const store = createStore(mainReducer, enhancer);

// mount the site on the DOM

render(<Main store={store} />, document.getElementById('root'));
