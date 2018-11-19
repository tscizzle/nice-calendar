import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import api from 'api';
import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withEditingEventFormData from 'state-management/state-connectors/with-editing-event-form-data';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape } from 'models/user';
import { eventShape } from 'models/event';

import NiceButton, { CircleButton } from 'components/nice-button/nice-button';
import NiceInput from 'components/nice-input/nice-input';
import NiceSelect from 'components/nice-select/nice-select';
import {
  NiceFormRow,
  NiceFormSubmitRow,
  NiceFormErrorMsg,
} from 'components/nice-form/nice-form';
import Divider from 'components/divider/divider';

import 'stylesheets/components/edit-event-form/edit-event-form.css';

class EditEventForm extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    timezone: PropTypes.string.isRequired,
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
    const { datetime } = editingEventFormData;
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
    const editingEventMoment = moment(datetime).tz(timezone);
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

  setEventDate = ({ value }) => {
    const {
      timezone,
      editingEventFormData,
      setEditingEventFormData,
    } = this.props;
    const newDayMoment = moment.tz(value, timezone);
    const { datetime } = editingEventFormData;
    const eventMoment = moment(datetime).tz(timezone);
    const newDatetime = newDayMoment
      .clone()
      .set({
        hour: eventMoment.hour(),
        minute: eventMoment.minute(),
      })
      .toDate();
    const newEvent = {
      ...editingEventFormData,
      datetime: newDatetime,
    };
    setEditingEventFormData({ event: newEvent });
  };

  getSetEventTimeFunc = unit => {
    const setEventTime = evt => {
      const {
        timezone,
        editingEventFormData,
        setEditingEventFormData,
      } = this.props;
      const value = parseInt(evt.target.value, 10);
      const { datetime } = editingEventFormData;
      const eventMoment = moment(datetime).tz(timezone);
      const newDatetime = eventMoment
        .clone()
        .set({ [unit]: value })
        .toDate();
      const newEvent = {
        ...editingEventFormData,
        datetime: newDatetime,
      };
      setEditingEventFormData({ event: newEvent });
    };
    return setEventTime;
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
    const { title, datetime } = eventDoc;
    if (!title) {
      return 'Give your Event a title.';
    }
    const eventMoment = moment(datetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const earliestAllowedMoment = nowMinuteMoment.clone().add(1, 'minutes');
    const isTooEarly = eventMoment.isBefore(earliestAllowedMoment);
    if (isTooEarly) {
      return 'Make your Event later than now.';
    }
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
        api.upsertEvent({ event: editingEventFormData }).then(() => {
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
    const userId = loggedInUser._id;
    api.deleteEvent({ eventId, userId }).then(() => {
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
      datetime,
      isRecurring,
      recurringSchedule = {},
    } = editingEventFormData;
    const eventMoment = moment(datetime).tz(timezone);
    const eventDateValue = eventMoment.format(this.dayValueFormat);
    const eventHourValue = eventMoment.format('HH');
    const eventMinuteValue = eventMoment.format('mm');
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
              isBold={true}
              focusOnMount={true}
            />
          </NiceFormRow>
          <NiceFormRow>
            <NiceSelect
              containerClassName="edit-event-form-date-select"
              options={this.dayOptions()}
              onChange={this.setEventDate}
              selectedValue={eventDateValue}
            />
            <NiceInput
              value={eventHourValue}
              onChange={this.getSetEventTimeFunc('hour')}
              type="number"
              min={0}
              max={23}
            />
            :
            <NiceInput
              value={eventMinuteValue}
              onChange={this.getSetEventTimeFunc('minute')}
              type="number"
              min={0}
              max={59}
            />
          </NiceFormRow>
          <NiceFormRow>
            <NiceInput
              checked={isRecurring}
              onChange={this.setIsRecurring}
              type="checkbox"
              label="Recurring every…"
            />
          </NiceFormRow>
          {isRecurring && (
            <NiceFormRow>
              <NiceInput
                value={everyX}
                onChange={this.setEveryX}
                type="number"
                min={1}
                max={99}
              />{' '}
              <NiceSelect
                options={this.everyUnitOptions()}
                onChange={this.setEveryUnit}
                selectedValue={everyUnit}
              />
            </NiceFormRow>
          )}
          <NiceFormSubmitRow>
            <NiceButton
              onClick={this.saveEvent}
              isPrimary={true}
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
        <Divider />
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
