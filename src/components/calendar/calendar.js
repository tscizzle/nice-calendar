import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import _ from 'lodash';
import { FaTimes } from 'react-icons/fa';

import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';

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
    addingEventFormData: PropTypes.object.isRequired,
    setAddingEventFormData: PropTypes.func.isRequired,
  };

  closeAddingEventForm = () => {
    const { setAddingEventFormData } = this.props;
    setAddingEventFormData({ event: null });
  };

  render() {
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
      </div>
    );
  }
}

AddEventForm = withAddingEventFormData(AddEventForm);
