import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import { FaTimes } from 'react-icons/fa';

import { addEvent } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape, getTimezoneFromUser } from 'models/user';

import NiceButton from 'components/nice-button/nice-button';
import NiceInput from 'components/nice-input/nice-input';
import NiceSelect from 'components/nice-select/nice-select';
import {
  NiceFormRow,
  NiceFormSubmitRow,
  NiceFormErrorMsg,
} from 'components/nice-form/nice-form';

import 'stylesheets/components/add-event-form/add-event-form.css';

class AddEventForm extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    fetchEvents: PropTypes.func.isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    addingEventFormData: PropTypes.object.isRequired,
    setAddingEventFormData: PropTypes.func.isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    hasAttemptedSave: false,
  };

  dayOptions = () => {
    const {
      loggedInUser,
      selectedDatetime,
      selectedZoom,
      addingEventFormData,
      nowMinute,
    } = this.props;
    const { startDatetime } = addingEventFormData;
    const timezone = getTimezoneFromUser(loggedInUser);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const selectionStart = selectedMoment.clone().startOf(selectedZoom);
    const selectionEnd = selectedMoment.clone().endOf(selectedZoom);
    const numDays = selectionEnd.diff(selectionStart, 'days') + 1;
    const options = [];
    _.times(numDays, day => {
      const dayMoment = selectionStart.clone().add(day, 'days');
      const dayEnd = dayMoment.clone().endOf('day');
      const dayIsBeforeNow = dayEnd.isBefore(nowMinuteMoment);
      if (!dayIsBeforeNow) {
        const value = dayMoment.format('YYYY-MM-DD');
        const label = dayMoment.format('MMM D');
        const labelWhenSelected = dayMoment.format('MMM D, YYYY');
        options.push({ value, label, labelWhenSelected });
      }
    });
    const addingEventMoment = moment(startDatetime).tz(timezone);
    const addingEventOption = {
      value: addingEventMoment.format('YYYY-MM-DD'),
      label: addingEventMoment.format('MMM D'),
      labelWhenSelected: addingEventMoment.format('MMM D, YYYY'),
    };
    const isAddingBeforeSelection = selectionStart.isAfter(addingEventMoment);
    const isAddingAfterSelection = selectionEnd.isBefore(addingEventMoment);
    if (isAddingBeforeSelection) {
      options.unshift(addingEventOption);
    } else if (isAddingAfterSelection) {
      options.push(addingEventOption);
    }
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

  validateEventDoc = eventDoc => {
    const { loggedInUser, nowMinute } = this.props;
    const { title, startDatetime } = eventDoc;
    // validate there is a title
    if (!title) {
      return 'Give your Event a title.';
    }
    // validate the event datetime is in the future
    const timezone = getTimezoneFromUser(loggedInUser);
    const startMoment = moment(startDatetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const earliestAllowedMoment = nowMinuteMoment.clone().add(1, 'minutes');
    const isTooEarly = startMoment.isBefore(earliestAllowedMoment);
    if (isTooEarly) {
      return 'Make your Event later than now.';
    }
    // if everything is fine, return no message
    return '';
  };

  saveEvent = () => {
    const {
      loggedInUser,
      fetchEvents,
      addingEventFormData,
      setAddingEventFormData,
    } = this.props;
    this.setState({ hasAttemptedSave: true }, () => {
      const validationErrorMsg = this.validateEventDoc(addingEventFormData);
      if (!validationErrorMsg) {
        addEvent({ event: addingEventFormData }).then(() => {
          setAddingEventFormData({ event: null });
          fetchEvents({ user: loggedInUser });
        });
      }
    });
  };

  render() {
    const { loggedInUser, addingEventFormData } = this.props;
    const { hasAttemptedSave } = this.state;
    const { title, startDatetime } = addingEventFormData;
    const timezone = getTimezoneFromUser(loggedInUser);
    const startMoment = moment(startDatetime).tz(timezone);
    const startDateValue = startMoment.format('YYYY-MM-DD');
    const startHourValue = startMoment.format('HH');
    const startMinuteValue = startMoment.format('mm');
    const validationErrorMsg = this.validateEventDoc(addingEventFormData);
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
          {hasAttemptedSave &&
            validationErrorMsg && (
              <NiceFormErrorMsg errorMsg={validationErrorMsg} />
            )}
        </div>
      </div>
    );
  }
}

AddEventForm = _.flow([
  withUser,
  withEvents,
  withSelectedDatetime,
  withSelectedZoom,
  withAddingEventFormData,
  withNowMinute,
])(AddEventForm);

export default AddEventForm;
