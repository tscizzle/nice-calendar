import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { upsertEvent } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape, getTimezoneFromUser } from 'models/user';
import { eventShape } from 'models/event';

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
    events: PropTypes.objectOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    addingEventFormData: PropTypes.object.isRequired,
    isEditingExistingEvent: PropTypes.bool.isRequired,
    setAddingEventFormData: PropTypes.func.isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    hasAttemptedSave: false,
  };

  dayValueFormat = 'YYYY-MM-DD';

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
    const valueFormat = this.dayValueFormat;
    const labelFormat = 'MMM D';
    const labelWhenSelectedFormat = 'MMM D, YYYY';
    const options = [];
    _.times(numDays, day => {
      const dayMoment = selectionStart.clone().add(day, 'days');
      const dayEnd = dayMoment.clone().endOf('day');
      const dayIsBeforeNow = dayEnd.isBefore(nowMinuteMoment);
      if (!dayIsBeforeNow) {
        const value = dayMoment.format(valueFormat);
        const label = dayMoment.format(labelFormat);
        const labelWhenSelected = dayMoment.format(labelWhenSelectedFormat);
        options.push({ value, label, labelWhenSelected });
      }
    });
    const addingEventMoment = moment(startDatetime).tz(timezone);
    const addingEventOption = {
      value: addingEventMoment.format(valueFormat),
      label: addingEventMoment.format(labelFormat),
      labelWhenSelected: addingEventMoment.format(labelWhenSelectedFormat),
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

  everyUnitOptions = () => [
    { value: 'day', label: 'days' },
    { value: 'week', label: 'weeks' },
    { value: 'month', label: 'months' },
  ];

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

  setStartDate = ({ value }) => {
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

  setIsRecurring = evt => {
    const { addingEventFormData, setAddingEventFormData } = this.props;
    const newIsRecurring = evt.target.checked;
    const newEvent = {
      ...addingEventFormData,
      isRecurring: newIsRecurring,
    };
    if (newEvent.isRecurring && !newEvent.recurringSchedule) {
      newEvent.recurringSchedule = {
        repetitionType: 'everyXUnits',
        everyX: 1,
        everyUnit: 'week',
      };
    }
    setAddingEventFormData({ event: newEvent });
  };

  setEveryX = evt => {
    const { addingEventFormData, setAddingEventFormData } = this.props;
    const newEveryX = evt.target.value;
    const { recurringSchedule } = addingEventFormData;
    const newRecurringSchedule = {
      ...recurringSchedule,
      everyX: newEveryX,
    };
    const newEvent = {
      ...addingEventFormData,
      recurringSchedule: newRecurringSchedule,
    };
    setAddingEventFormData({ event: newEvent });
  };

  setEveryUnit = ({ value }) => {
    const { addingEventFormData, setAddingEventFormData } = this.props;
    const { recurringSchedule } = addingEventFormData;
    const newRecurringSchedule = {
      ...recurringSchedule,
      everyUnit: value,
    };
    const newEvent = {
      ...addingEventFormData,
      recurringSchedule: newRecurringSchedule,
    };
    setAddingEventFormData({ event: newEvent });
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
        upsertEvent({ event: addingEventFormData }).then(() => {
          setAddingEventFormData({ event: null });
          fetchEvents({ user: loggedInUser });
        });
      }
    });
  };

  render() {
    const {
      loggedInUser,
      addingEventFormData,
      isEditingExistingEvent,
    } = this.props;
    const { hasAttemptedSave } = this.state;
    const {
      title,
      startDatetime,
      isRecurring,
      recurringSchedule = {},
    } = addingEventFormData;
    const timezone = getTimezoneFromUser(loggedInUser);
    const startMoment = moment(startDatetime).tz(timezone);
    const startDateValue = startMoment.format(this.dayValueFormat);
    const startHourValue = startMoment.format('HH');
    const startMinuteValue = startMoment.format('mm');
    const everyX = recurringSchedule ? recurringSchedule.everyX : 1;
    const everyUnit = recurringSchedule ? recurringSchedule.everyUnit : 'week';
    const validationErrorMsg = this.validateEventDoc(addingEventFormData);
    const isError = hasAttemptedSave && Boolean(validationErrorMsg);
    return (
      <div className="add-event-form">
        <div className="add-event-form-top">
          <div className="add-event-form-header">
            <div className="add-event-form-dot" />
            {isEditingExistingEvent ? 'Editing event…' : 'Adding event…'}
          </div>
          <div
            className="add-event-form-close-button"
            onClick={this.closeAddingEventForm}
          >
            <FontAwesomeIcon icon="times" />
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
          <NiceFormRow>
            <NiceInput
              checked={isRecurring}
              onChange={this.setIsRecurring}
              isBare={true}
              type="checkbox"
              label="Recurring every…"
            />
          </NiceFormRow>
          {isRecurring && (
            <NiceFormRow>
              <NiceInput
                value={everyX}
                onChange={this.setEveryX}
                isBare={true}
                type="number"
                min={1}
                max={99}
              />{' '}
              <NiceSelect
                options={this.everyUnitOptions()}
                onChange={this.setEveryUnit}
                selectedValue={everyUnit}
                isBare={true}
              />
            </NiceFormRow>
          )}
          <NiceFormSubmitRow>
            <NiceButton
              onClick={this.saveEvent}
              isPrimary={true}
              isCompact={true}
              isDisabled={isError}
            >
              {isEditingExistingEvent ? 'Update' : 'Save'}
            </NiceButton>
          </NiceFormSubmitRow>
          {isError && <NiceFormErrorMsg errorMsg={validationErrorMsg} />}
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
