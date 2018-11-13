import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { upsertEvent, deleteEvent } from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withEditingEventFormData from 'state-management/state-connectors/with-editing-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape, getTimezoneFromUser } from 'models/user';
import { eventShape } from 'models/event';

import NiceButton, { CircleButton } from 'components/nice-button/nice-button';
import NiceInput from 'components/nice-input/nice-input';
import NiceSelect from 'components/nice-select/nice-select';
import {
  NiceFormRow,
  NiceFormSubmitRow,
  NiceFormErrorMsg,
} from 'components/nice-form/nice-form';

import 'stylesheets/components/edit-event-form/edit-event-form.css';

class EditEventForm extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    editingEventFormData: PropTypes.object.isRequired,
    isEditingExistingEvent: PropTypes.bool.isRequired,
    setEditingEventFormData: PropTypes.func.isRequired,
    nowMinute: PropTypes.instanceOf(Date).isRequired,
  };

  state = {
    hasAttemptedSave: false,
  };

  dayValueFormat = 'YYYY-MM-DD';

  dayOptions = () => {
    const {
      timezone,
      selectedDatetime,
      selectedZoom,
      editingEventFormData,
      nowMinute,
    } = this.props;
    const { startDatetime } = editingEventFormData;
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
    const editingEventMoment = moment(startDatetime).tz(timezone);
    const editingEventOption = {
      value: editingEventMoment.format(valueFormat),
      label: editingEventMoment.format(labelFormat),
      labelWhenSelected: editingEventMoment.format(labelWhenSelectedFormat),
    };
    const isEditingBeforeSelection = selectionStart.isAfter(editingEventMoment);
    const isEditingAfterSelection = selectionEnd.isBefore(editingEventMoment);
    if (isEditingBeforeSelection) {
      options.unshift(editingEventOption);
    } else if (isEditingAfterSelection) {
      options.push(editingEventOption);
    }
    return options;
  };

  everyUnitOptions = () => [
    { value: 'day', label: 'days' },
    { value: 'week', label: 'weeks' },
    { value: 'month', label: 'months' },
  ];

  closeEditingEventForm = () => {
    const { setEditingEventFormData } = this.props;
    setEditingEventFormData({ event: null });
  };

  setTitle = evt => {
    const { editingEventFormData, setEditingEventFormData } = this.props;
    const newTitle = evt.target.value;
    const newEvent = { ...editingEventFormData, title: newTitle };
    setEditingEventFormData({ event: newEvent });
  };

  setStartDate = ({ value }) => {
    const {
      timezone,
      editingEventFormData,
      setEditingEventFormData,
    } = this.props;
    const newDayMoment = moment.tz(value, timezone);
    const { startDatetime } = editingEventFormData;
    const startMoment = moment(startDatetime).tz(timezone);
    const newStartDatetime = newDayMoment
      .clone()
      .set({
        hour: startMoment.hour(),
        minute: startMoment.minute(),
      })
      .toDate();
    const newEvent = {
      ...editingEventFormData,
      startDatetime: newStartDatetime,
    };
    setEditingEventFormData({ event: newEvent });
  };

  getSetStartTimeFunc = unit => {
    const setStartTime = evt => {
      const {
        timezone,
        editingEventFormData,
        setEditingEventFormData,
      } = this.props;
      const value = parseInt(evt.target.value, 10);
      const { startDatetime } = editingEventFormData;
      const startMoment = moment(startDatetime).tz(timezone);
      const newStartDatetime = startMoment
        .clone()
        .set({ [unit]: value })
        .toDate();
      const newEvent = {
        ...editingEventFormData,
        startDatetime: newStartDatetime,
      };
      setEditingEventFormData({ event: newEvent });
    };
    return setStartTime;
  };

  setIsRecurring = evt => {
    const { editingEventFormData, setEditingEventFormData } = this.props;
    const newIsRecurring = evt.target.checked;
    const newEvent = { ...editingEventFormData, isRecurring: newIsRecurring };
    if (newEvent.isRecurring && !newEvent.recurringSchedule) {
      newEvent.recurringSchedule = {
        repetitionType: 'everyXUnits',
        everyX: 1,
        everyUnit: 'week',
      };
    }
    setEditingEventFormData({ event: newEvent });
  };

  setEveryX = evt => {
    const { editingEventFormData, setEditingEventFormData } = this.props;
    const newEveryX = evt.target.value;
    const { recurringSchedule } = editingEventFormData;
    const newRecurringSchedule = { ...recurringSchedule, everyX: newEveryX };
    const newEvent = {
      ...editingEventFormData,
      recurringSchedule: newRecurringSchedule,
    };
    setEditingEventFormData({ event: newEvent });
  };

  setEveryUnit = ({ value }) => {
    const { editingEventFormData, setEditingEventFormData } = this.props;
    const { recurringSchedule } = editingEventFormData;
    const newRecurringSchedule = { ...recurringSchedule, everyUnit: value };
    const newEvent = {
      ...editingEventFormData,
      recurringSchedule: newRecurringSchedule,
    };
    setEditingEventFormData({ event: newEvent });
  };

  validateEventDoc = eventDoc => {
    const { timezone, nowMinute } = this.props;
    const { title, startDatetime } = eventDoc;
    // validate there is a title
    if (!title) {
      return 'Give your Event a title.';
    }
    // validate the event datetime is in the future
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
      editingEventFormData,
      setEditingEventFormData,
    } = this.props;
    this.setState({ hasAttemptedSave: true }, () => {
      const validationErrorMsg = this.validateEventDoc(editingEventFormData);
      if (!validationErrorMsg) {
        upsertEvent({ event: editingEventFormData }).then(() => {
          setEditingEventFormData({ event: null });
          fetchEvents({ user: loggedInUser });
        });
      }
    });
  };

  deleteEvent = () => {
    const {
      loggedInUser,
      fetchEvents,
      editingEventFormData,
      setEditingEventFormData,
    } = this.props;
    const eventId = editingEventFormData._id;
    deleteEvent({ eventId }).then(() => {
      setEditingEventFormData({ event: null });
      fetchEvents({ user: loggedInUser });
    });
  };

  escFunction = evt => evt.keyCode === 27 && this.closeEditingEventForm();

  componentDidMount() {
    document.addEventListener('keydown', this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  render() {
    const {
      timezone,
      editingEventFormData,
      isEditingExistingEvent,
    } = this.props;
    const { hasAttemptedSave } = this.state;
    const {
      title,
      startDatetime,
      isRecurring,
      recurringSchedule = {},
    } = editingEventFormData;
    const startMoment = moment(startDatetime).tz(timezone);
    const startDateValue = startMoment.format(this.dayValueFormat);
    const startHourValue = startMoment.format('HH');
    const startMinuteValue = startMoment.format('mm');
    const everyX = recurringSchedule ? recurringSchedule.everyX : 1;
    const everyUnit = recurringSchedule ? recurringSchedule.everyUnit : 'week';
    const validationErrorMsg = this.validateEventDoc(editingEventFormData);
    const isError = hasAttemptedSave && Boolean(validationErrorMsg);
    return (
      <div className="edit-event-form">
        <div className="edit-event-form-top">
          <div className="edit-event-form-header">
            {isEditingExistingEvent ? 'Editing event…' : 'Adding event…'}
          </div>
          <CircleButton onClick={this.closeEditingEventForm}>
            <FontAwesomeIcon icon="times" />
          </CircleButton>
        </div>
        <div className="edit-event-form-content">
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
              containerClassName="edit-event-form-date-select"
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
            <CircleButton
              className="edit-event-form-action-button"
              isSmall={true}
              onClick={this.deleteEvent}
            >
              <FontAwesomeIcon icon="trash" />
            </CircleButton>
            {isError && <NiceFormErrorMsg errorMsg={validationErrorMsg} />}
          </NiceFormSubmitRow>
        </div>
      </div>
    );
  }
}

EditEventForm = _.flow([
  withUser,
  withEvents,
  withSelectedDatetime,
  withSelectedZoom,
  withEditingEventFormData,
  withNowMinute,
])(EditEventForm);

export default EditEventForm;
