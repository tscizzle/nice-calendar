import moment from 'moment-timezone';

import {
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  FETCH_EVENTS_SUCCESS,
  FETCH_EVENTS_FAILURE,
  FETCH_OCCURRENCES_SUCCESS,
  FETCH_OCCURRENCES_FAILURE,
  SET_SELECTED_DATETIME,
  SET_SELECTED_ZOOM,
  SET_EDITING_EVENT,
  UPDATE_NOW_MINUTE,
} from 'state-management/actions';

const getInitialState = () => ({
  loggedInUser: null,
  events: {},
  occurrences: {},
  selectedDatetime: moment().toDate(),
  selectedZoom: 'month',
  editingEventFormData: null,
  nowMinute: moment()
    .startOf('minute')
    .toDate(),
  hasAttemptedFetchUser: false,
});

const mainReducer = (state = getInitialState(), action) => {
  const verbose = false;
  // const verbose = true;
  if (verbose) {
    console.log(`=== Action: ${action.type} ===`);
    console.log('Action:', action);
    console.log('State BEFORE:', state);
  }
  let newState;
  switch (action.type) {
    case FETCH_USER_SUCCESS:
      newState = {
        ...state,
        loggedInUser: action.user,
        hasAttemptedFetchUser: true,
      };
      break;
    case FETCH_USER_FAILURE:
      newState = {
        ...state,
        loggedInUser: null,
        hasAttemptedFetchUser: true,
      };
      break;
    case FETCH_EVENTS_SUCCESS:
      newState = { ...state, events: action.events };
      break;
    case FETCH_EVENTS_FAILURE:
      newState = { ...state, events: {} };
      break;
    case FETCH_OCCURRENCES_SUCCESS:
      newState = { ...state, occurrences: action.occurrences };
      break;
    case FETCH_OCCURRENCES_FAILURE:
      newState = { ...state, occurrences: {} };
      break;
    case SET_SELECTED_DATETIME:
      newState = { ...state, selectedDatetime: action.datetime };
      break;
    case SET_SELECTED_ZOOM:
      newState = { ...state, selectedZoom: action.zoom };
      break;
    case SET_EDITING_EVENT:
      const newSelectedDatetime = action.event
        ? action.event.datetime
        : state.selectedDatetime;
      newState = {
        ...state,
        selectedDatetime: newSelectedDatetime,
        editingEventFormData: action.event,
      };
      break;
    case UPDATE_NOW_MINUTE:
      newState = { ...state, nowMinute: action.datetime };
      break;
    default:
      newState = state;
      break;
  }
  if (verbose) {
    console.log('State AFTER:', newState);
  }
  return newState;
};

export default mainReducer;
