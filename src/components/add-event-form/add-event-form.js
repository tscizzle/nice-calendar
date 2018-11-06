import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import { FaTimes } from 'react-icons/fa';

import { addEvent } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';
import { userShape, getTimezoneFromUser } from 'models/user';

import NiceButton from 'components/nice-button/nice-button';
import NiceInput from 'components/nice-input/nice-input';
import NiceSelect from 'components/nice-select/nice-select';
import { NiceFormRow, NiceFormSubmitRow } from 'components/nice-form/nice-form';

import 'stylesheets/components/add-event-form/add-event-form.css';

class AddEventForm extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    fetchEvents: PropTypes.func.isRequired,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    addingEventFormData: PropTypes.object.isRequired,
    setAddingEventFormData: PropTypes.func.isRequired,
  };

  dayOptions = () => {
    const { loggedInUser, selectedZoom, addingEventFormData } = this.props;
    const { startDatetime } = addingEventFormData;
    const timezone = getTimezoneFromUser(loggedInUser);
    const startMoment = moment(startDatetime).tz(timezone);
    const start = startMoment.clone().startOf(selectedZoom);
    const end = startMoment.clone().endOf(selectedZoom);
    const numDays = end.diff(start, 'days') + 1;
    const options = _.times(numDays, day => {
      const dayMoment = start.clone().add(day, 'days');
      const value = dayMoment.format('YYYY-MM-DD');
      const label = dayMoment.format('MMM D');
      const labelWhenSelected = dayMoment.format('MMM D, YYYY');
      return { value, label, labelWhenSelected };
    });
    return options;
  };

  closeAddingEventForm = () => {
    const { setAddingEventFormData } = this.props;
    setAddingEventFormData({ event: null });
  };

  setTitle = evt => {
    const { addingEventFormData, setAddingEventFormData } = this.props;
    const newTitle = evt.target.value;
    const newEvent = {
      ...addingEventFormData,
      title: newTitle,
    };
    setAddingEventFormData({ event: newEvent });
  };

  setStartDate = ({ value }, callback) => {
    const {
      loggedInUser,
      addingEventFormData,
      setAddingEventFormData,
    } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const newDayMoment = moment.tz(value, timezone);
    const { startDatetime } = addingEventFormData;
    const startMoment = moment(startDatetime).tz(timezone);
    const newStartDatetime = newDayMoment
      .clone()
      .set({
        hour: startMoment.hour(),
        minute: startMoment.minute(),
      })
      .toDate();
    const newEvent = {
      ...addingEventFormData,
      startDatetime: newStartDatetime,
    };
    setAddingEventFormData({ event: newEvent });
    callback();
  };

  getSetStartTimeFunc = unit => {
    const setStartTime = evt => {
      const {
        loggedInUser,
        addingEventFormData,
        setAddingEventFormData,
      } = this.props;
      const value = parseInt(evt.target.value, 10);
      const timezone = getTimezoneFromUser(loggedInUser);
      const { startDatetime } = addingEventFormData;
      const startMoment = moment(startDatetime).tz(timezone);
      const newStartDatetime = startMoment
        .clone()
        .set({ [unit]: value })
        .toDate();
      const newEvent = {
        ...addingEventFormData,
        startDatetime: newStartDatetime,
      };
      setAddingEventFormData({ event: newEvent });
    };
    return setStartTime;
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
    const { loggedInUser, addingEventFormData } = this.props;
    const { title, startDatetime } = addingEventFormData;
    const timezone = getTimezoneFromUser(loggedInUser);
    const startMoment = moment(startDatetime).tz(timezone);
    const startDateValue = startMoment.format('YYYY-MM-DD');
    const startHourValue = startMoment.format('HH');
    const startMinuteValue = startMoment.format('mm');
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
          <NiceFormRow>
            <NiceInput
              value={title}
              onChange={this.setTitle}
              placeholder="Title"
              isFull={true}
              isBare={true}
              isBold={true}
              focusOnMount={true}
            />
          </NiceFormRow>
          <NiceFormRow>
            <NiceSelect
              containerClassName="add-event-form-date-select"
              options={this.dayOptions()}
              onChange={this.setStartDate}
              selectedValue={startDateValue}
              isBare={true}
            />
            <NiceInput
              value={startHourValue}
              onChange={this.getSetStartTimeFunc('hour')}
              isBare={true}
              type="number"
              min={0}
              max={23}
            />
            :
            <NiceInput
              value={startMinuteValue}
              onChange={this.getSetStartTimeFunc('minute')}
              isBare={true}
              type="number"
              min={0}
              max={59}
            />
          </NiceFormRow>
          <NiceFormSubmitRow>
            <NiceButton
              onClick={this.saveEvent}
              isPrimary={true}
              isCompact={true}
            >
              Save
            </NiceButton>
          </NiceFormSubmitRow>
        </div>
      </div>
    );
  }
}

AddEventForm = _.flow([
  withUser,
  withEvents,
  withSelectedZoom,
  withAddingEventFormData,
])(AddEventForm);

export default AddEventForm;
