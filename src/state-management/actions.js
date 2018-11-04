import { getLoggedInUser, getEvents, getOccurrences } from 'api';

/* Action Types */

export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS';
export const FETCH_EVENTS_FAILURE = 'FETCH_EVENTS_FAILURE';

export const FETCH_OCCURRENCES_SUCCESS = 'FETCH_OCCURRENCES_SUCCESS';
export const FETCH_OCCURRENCES_FAILURE = 'FETCH_OCCURRENCES_FAILURE';

export const SET_SELECTED_DATETIME = 'SET_SELECTED_DATETIME';
export const SET_SELECTED_ZOOM = 'SET_SELECTED_ZOOM';
export const SET_ADDING_EVENT = 'SET_ADDING_EVENT';

/* Action Creators */

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

export const fetchOccurrencesSuccess = ({ occurrences }) => ({
  type: FETCH_OCCURRENCES_SUCCESS,
  occurrences,
});

export const fetchOccurrencesFailure = () => ({
  type: FETCH_OCCURRENCES_FAILURE,
});

export const fetchOccurrences = ({ userId }) => {
  return dispatch => {
    getOccurrences({ userId })
      .then(({ occurrences }) => {
        if (occurrences) {
          dispatch(fetchOccurrencesSuccess({ occurrences }));
        } else {
          dispatch(fetchOccurrencesFailure());
        }
      })
      .catch(() => {
        dispatch(fetchOccurrencesFailure());
      });
  };
};

export const setSelectedDatetime = ({ datetime }) => ({
  type: SET_SELECTED_DATETIME,
  datetime,
});

export const setSelectedZoom = ({ zoom }) => ({
  type: SET_SELECTED_ZOOM,
  zoom,
});

export const setAddingEventFormData = ({ event }) => ({
  type: SET_ADDING_EVENT,
  event,
});
