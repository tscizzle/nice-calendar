import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import _ from 'lodash';
import { FaTimes } from 'react-icons/fa';

import { addEvent } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';
import { userShape } from 'models/user';

import DayView from 'components/day-view/day-view';
import WeekView from 'components/week-view/week-view';
import MonthView from 'components/month-view/month-view';

import 'stylesheets/components/calendar/calendar.css';

let Calendar = ({ selectedZoom, addingEventFormData }) => {
  const calendarComponent = {
    day: DayView,
    week: WeekView,
    month: MonthView,
  }[selectedZoom];
  const calendar = React.createElement(calendarComponent);
  return (
    <div className="calendar-container">
      {addingEventFormData && <AddEventForm />}
      {calendar}
    </div>
  );
};

Calendar.propTypes = {
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  addingEventFormData: PropTypes.object,
};

Calendar = _.flow([withSelectedZoom, withAddingEventFormData])(Calendar);

export default Calendar;

class AddEventForm extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    fetchEvents: PropTypes.func.isRequired,
    addingEventFormData: PropTypes.object.isRequired,
    setAddingEventFormData: PropTypes.func.isRequired,
  };

  closeAddingEventForm = () => {
    const { setAddingEventFormData } = this.props;
    setAddingEventFormData({ event: null });
  };

  setTitle = changeEvent => {
    const { addingEventFormData, setAddingEventFormData } = this.props;
    const newTitle = changeEvent.target.value;
    const newEvent = {
      ...addingEventFormData,
      title: newTitle,
    };
    setAddingEventFormData({ event: newEvent });
  };

  setStartDatetime = changeEvent => {
    const { addingEventFormData, setAddingEventFormData } = this.props;
    const newStartDatetime = changeEvent.target.value;
    const newEvent = {
      ...addingEventFormData,
      startDatetime: newStartDatetime,
    };
    setAddingEventFormData({ event: newEvent });
  };

  saveEvent = () => {
    const {
      loggedInUser,
      fetchEvents,
      addingEventFormData,
      setAddingEventFormData,
    } = this.props;
    addEvent({ event: addingEventFormData }).then(() => {
      setAddingEventFormData({ event: null });
      fetchEvents({ user: loggedInUser });
    });
  };

  render() {
    const { addingEventFormData } = this.props;
    const { title, startDatetime } = addingEventFormData;
    return (
      <div className="add-event-form">
        <div className="add-event-form-top">
          <div
            className="add-event-form-close-button"
            onClick={this.closeAddingEventForm}
          >
            <FaTimes />
          </div>
        </div>
        <div className="add-event-form-content">
          <input value={title} onChange={this.setTitle} />
          <button onClick={this.saveEvent}>Save</button>
        </div>
      </div>
    );
  }
}

AddEventForm = _.flow([withUser, withEvents, withAddingEventFormData])(
  AddEventForm
);
