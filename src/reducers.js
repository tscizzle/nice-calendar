import {
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  RESET_APP_STATE,
} from './actions';

const initialState = () => ({
  loggedInUser: null,
});

const mainReducer = (state = initialState(), action) => {
  console.log('running main reducer', state, action);
  let newState;
  switch (action.type) {
    case FETCH_USER_SUCCESS:
      newState = {
        ...state,
        loggedInUser: action.user,
      };
      break;
    case FETCH_USER_FAILURE:
      newState = {
        ...state,
        loggedInUser: null,
      };
      break;
    case RESET_APP_STATE:
      newState = initialState();
      break;
    default:
      newState = state;
      break;
  }
  console.log('new state', newState);
  return newState;
};

export default mainReducer;
