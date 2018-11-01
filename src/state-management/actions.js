import { getLoggedInUser, getEvents } from 'api';

/* Action Types */

export const SET_SELECTED_ZOOM = 'SET_SELECTED_ZOOM';

export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS';
export const FETCH_EVENTS_FAILURE = 'FETCH_EVENTS_FAILURE';

export const FETCH_OCCURRENCES_SUCCESS = 'FETCH_OCCURRENCES_SUCCESS';
export const FETCH_OCCURRENCES_FAILURE = 'FETCH_OCCURRENCES_FAILURE';

export const RESET_APP_STATE = 'RESET_APP_STATE';

/* Action Creators */

export const setSelectedZoom = ({ zoom }) => ({
  type: SET_SELECTED_ZOOM,
  zoom,
});

export const fetchUserSuccess = ({ user }) => ({
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
          dispatch(fetchUserSuccess({ user }));
        } else {
          dispatch(fetchUserFailure());
        }
      })
      .catch(() => {
        dispatch(fetchUserFailure());
      });
  };
};

export const fetchEventsSuccess = ({ events }) => ({
  type: FETCH_EVENTS_SUCCESS,
  events,
});

export const fetchEventsFailure = () => ({
  type: FETCH_EVENTS_FAILURE,
});

export const fetchEvents = ({ userId }) => {
  return dispatch => {
    getEvents({ userId })
      .then(({ events }) => {
        if (events) {
          dispatch(fetchEventsSuccess({ events }));
        } else {
          dispatch(fetchEventsFailure());
        }
      })
      .catch(() => {
        dispatch(fetchEventsFailure());
      });
  };
};

export const resetAppState = () => ({
  type: RESET_APP_STATE,
});
