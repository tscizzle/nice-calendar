import moment from 'moment-timezone';

import api from 'api';

/* Action Types */

export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS';
export const FETCH_EVENTS_FAILURE = 'FETCH_EVENTS_FAILURE';

export const FETCH_OCCURRENCES_SUCCESS = 'FETCH_OCCURRENCES_SUCCESS';
export const FETCH_OCCURRENCES_FAILURE = 'FETCH_OCCURRENCES_FAILURE';

export const SET_SELECTED_DATETIME = 'SET_SELECTED_DATETIME';
export const SET_SELECTED_ZOOM = 'SET_SELECTED_ZOOM';
export const SET_EDITING_EVENT = 'SET_EDITING_EVENT';

export const UPDATE_NOW_MINUTE = 'UPDATE_NOW_MINUTE';

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
    api
      .getLoggedInUser()
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
    api
      .getEvents({ userId })
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
    api
      .getOccurrences({ userId })
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

export const setEditingEventFormData = ({ event }) => ({
  type: SET_EDITING_EVENT,
  event,
});

export const updateNowMinute = () => {
  const datetime = moment()
    .startOf('minute')
    .toDate();
  return {
    type: UPDATE_NOW_MINUTE,
    datetime,
  };
};
