import { getLoggedInUser } from './api';

/*
 * Action Types
 */

export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const RESET_APP_STATE = 'RESET_APP_STATE';

/*
 * Action Creators
 */

export const fetchUserSuccess = user => ({
  type: FETCH_USER_SUCCESS,
  user,
});

export const fetchUserFailure = () => ({
  type: FETCH_USER_FAILURE,
});

export const fetchUser = () => {
  return dispatch => {
    getLoggedInUser()
      .then(({ user }) => {
        if (user) {
          dispatch(fetchUserSuccess(user));
        } else {
          dispatch(fetchUserFailure());
        }
      })
      .catch(() => {
        dispatch(fetchUserFailure());
      });
  };
};

export const resetAppState = () => ({
  type: RESET_APP_STATE,
});
