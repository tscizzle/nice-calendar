import {
  FETCH_EVENTS_SUCCESS,
  FETCH_EVENTS_FAILURE,
  FETCH_OCCURRENCES_SUCCESS,
  FETCH_OCCURRENCES_FAILURE,
  SET_SELECTED_ZOOM,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  RESET_APP_STATE,
} from 'state-management/actions';

const initialState = () => ({
  loggedInUser: null,
  events: {},
  occurrences: {},
  selectedZoom: 'month',
});

const mainReducer = (state = initialState(), action) => {
  const verbose = false;
  if (verbose) {
    console.log(`=== Action: ${action.type}`);
    console.log('Action:', action);
    console.log('State BEFORE:', state);
  }
  let newState;
  switch (action.type) {
    case FETCH_USER_SUCCESS:
      newState = { ...state, loggedInUser: action.user };
      break;
    case FETCH_USER_FAILURE:
      newState = { ...state, loggedInUser: null };
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
    case SET_SELECTED_ZOOM:
      newState = { ...state, selectedZoom: action.zoom };
      break;
    case RESET_APP_STATE:
      newState = initialState();
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
