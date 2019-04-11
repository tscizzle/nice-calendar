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

const { getNextScheduledOccurrence } = require('common/model-methods/event');

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
    typedTitle: '',
    hasTypedTitle: false,
    typedNotes: '',
    hasTypedNotes: false,
    hasAttemptedSave: false,
  };

  dayValueFormat = 'YYYY-MM-DD';

  dayOptions = ({ isStopSelector = false }) => {
    const {
      timezone,
      selectedDatetime,
      selectedZoom,
      editingEventFormData,
      nowMinute,
    } = this.props;
    const { datetime, stopDatetime } = editingEventFormData;
    const editingEventMoment = moment(datetime).tz(timezone);
    const nowMinuteMoment = moment(nowMinute).tz(timezone);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const selectionStart = selectedMoment.clone().startOf(selectedZoom);
    const selectionEnd = selectedMoment.clone().endOf(selectedZoom);
    const numDays = selectionEnd.diff(selectionStart, 'days') + 1;
    const valueFormat = this.dayValueFormat;
    const labelFormat = 'MMM D';
    const labelWhenSelectedFormat = 'MMM D, YYYY';
    let options = [];
    _.times(numDays, day => {
      const dayMoment = selectionStart.clone().add(day, 'days');
      const dayEnd = dayMoment.clone().endOf('day');
      const dayIsBeforeNow = dayEnd.isBefore(nowMinuteMoment);
      const stopDateIsBeforeEvent =
        isStopSelector && dayEnd.isBefore(editingEventMoment);
      if (!dayIsBeforeNow && !stopDateIsBeforeEvent) {
        const value = dayMoment.format(valueFormat);
        const label = dayMoment.format(labelFormat);
        const labelWhenSelected = dayMoment.format(labelWhenSelectedFormat);
        options.push({ value, label, labelWhenSelected });
      }
    });
    if (!isStopSelector) {
      const editingEventOption = {
        value: editingEventMoment.format(valueFormat),
        label: editingEventMoment.format(labelFormat),
        labelWhenSelected: editingEventMoment.format(labelWhenSelectedFormat),
      };
      options.push(editingEventOption);
    } else if (isStopSelector) {
      const editingEventStopMoment = moment(stopDatetime).tz(timezone);
      const editingEventStopOption = {
        value: editingEventStopMoment.format(valueFormat),
        label: editingEventStopMoment.format(labelFormat),
        labelWhenSelected: editingEventStopMoment.format(
          labelWhenSelectedFormat
        ),
      };
      options.push(editingEventStopOption);
    }
    options = _.uniqBy(options, 'value');
    options = _.sortBy(options, 'value');
    return options;
  };

  everyUnitOptions = () => [
    { value: 'day', label: 'day(s)' },
    { value: 'week', label: 'week(s)' },
    { value: 'month', label: 'month(s)' },
  ];

  closeEditingEventForm = () => {
    const { setEditingEventFormData } = this.props;
    setEditingEventFormData({ event: null });
  };

  setTitle = evt => {
    const typedTitle = evt.target.value;
    this.setState({
      typedTitle,
      hasTypedTitle: true,
    });
  };

  getSetEventDateFunc = dateField => {
    const setEventDate = ({ value }) => {
      const {
        timezone,
        editingEventFormData,
        setEditingEventFormData,
      } = this.props;
      const newDayMoment = moment.tz(value, timezone);
      const { datetime } = editingEventFormData;
      const eventMoment = moment(datetime).tz(timezone);
      const endOfDayMoment = newDayMoment.clone().endOf('day');
      const timeReferenceMoment = {
        datetime: eventMoment,
        stopDatetime: endOfDayMoment,
      }[dateField];
      const newDateField = newDayMoment
        .clone()
        .set({
          hour: timeReferenceMoment.hour(),
          minute: timeReferenceMoment.minute(),
        })
        .toDate();
      const newEvent = {
        ...editingEventFormData,
        [dateField]: newDateField,
      };
      setEditingEventFormData({ event: newEvent });
    };
    return setEventDate;
  };

  setDatetime = this.getSetEventDateFunc('datetime');

  setStopDatetime = this.getSetEventDateFunc('stopDatetime');

  getSetEventTimeFunc = unit => {
    const setEventTime = evt => {
      const {
        timezone,
        editingEventFormData,
        setEditingEventFormData,
      } = this.props;
      const value = parseInt(evt.target.value, 10);
      const { low, high } = {
        hour: { low: 0, high: 23 },
        minute: { low: 0, high: 59 },
      }[unit];
      if (value < low || value > high) {
        return;
      }
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

  setEventHour = this.getSetEventTimeFunc('hour');

  setEventMinute = this.getSetEventTimeFunc('minute');

  setIsRecurring = evt => {
    const { editingEventFormData, setEditingEventFormData } = this.props;
    const newIsRecurring = evt.target.checked;
    const newEvent = { ...editingEventFormData, isRecurring: newIsRecurring };
    if (newEvent.isRecurring && !newEvent.recurringSchedule) {
      newEvent.recurringSchedule = {
        repetitionType: 'everyXUnits',
        everyX: 1,
        everyUnit: 'day',
      };
    }
    setEditingEventFormData({ event: newEvent });
  };

  setEveryX = evt => {
    const { editingEventFormData, setEditingEventFormData } = this.props;
    const newEveryX = parseInt(evt.target.value, 10);
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

  setIsStopping = evt => {
    const {
      timezone,
      editingEventFormData,
      setEditingEventFormData,
      nowMinute,
    } = this.props;
    const newIsStopping = evt.target.checked;
    const newEvent = { ...editingEventFormData, isStopping: newIsStopping };
    if (newEvent.isStopping && !newEvent.stopDatetime) {
      const nextScheduledOccurrence = getNextScheduledOccurrence({
        event: editingEventFormData,
        timezone,
        now: nowMinute,
      });
      if (nextScheduledOccurrence) {
        const newStopDatetime = moment(
          nextScheduledOccurrence.occurrence.datetime
        )
          .tz(timezone)
          .endOf('day')
          .toDate();
        newEvent.stopDatetime = newStopDatetime;
      }
    }
    setEditingEventFormData({ event: newEvent });
  };

  setNotes = evt => {
    const typedNotes = evt.target.value;
    this.setState({
      typedNotes,
      hasTypedNotes: true,
    });
  };

  getCurrentEventFormData = () => {
    const { editingEventFormData } = this.props;
    const { typedTitle, hasTypedTitle, typedNotes, hasTypedNotes } = this.state;
    const { title, notes } = editingEventFormData;
    const currentTitle = hasTypedTitle ? typedTitle : title;
    const currentNotes = hasTypedNotes ? typedNotes : notes;
    const currentEventFormData = {
      ...editingEventFormData,
      title: currentTitle,
      notes: currentNotes,
    };
    return currentEventFormData;
  };

  validateEventDoc = eventDoc => {
    const { timezone, nowMinute } = this.props;
    const { title, datetime, isStopping, stopDatetime } = eventDoc;
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
    if (isStopping) {
      const stopMoment = moment(stopDatetime).tz(timezone);
      const stopIsTooEarly = stopMoment.isBefore(eventMoment);
      if (stopIsTooEarly) {
        return 'Make your Event not stop before it starts.';
      }
    }
    return '';
  };

  saveEvent = () => {
    const { loggedInUser, fetchEvents, setEditingEventFormData } = this.props;
    this.setState({ hasAttemptedSave: true }, () => {
      const currentEventFormData = this.getCurrentEventFormData();
      const validationErrorMsg = this.validateEventDoc(currentEventFormData);
      if (!validationErrorMsg) {
        api.upsertEvent({ event: currentEventFormData }).then(() => {
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
    const { timezone, isEditingExistingEvent } = this.props;
    const { hasAttemptedSave } = this.state;
    const currentEventFormData = this.getCurrentEventFormData();
    const {
      title,
      datetime,
      isRecurring,
      recurringSchedule = {},
      isStopping = false,
      stopDatetime,
      notes,
    } = currentEventFormData;
    const eventMoment = moment(datetime).tz(timezone);
    const eventStopMoment = moment(stopDatetime).tz(timezone);
    const eventDateValue = eventMoment.format(this.dayValueFormat);
    const eventHourValue = eventMoment.format('HH');
    const eventMinuteValue = eventMoment.format('mm');
    const eventStopDateValue = eventStopMoment.format(this.dayValueFormat);
    const everyX = recurringSchedule ? recurringSchedule.everyX : 1;
    const everyUnit = recurringSchedule ? recurringSchedule.everyUnit : 'week';
    const validationErrorMsg = this.validateEventDoc(currentEventFormData);
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
              options={this.dayOptions({})}
              onChange={this.setDatetime}
              selectedValue={eventDateValue}
            />
            <div>
              <NiceInput
                containerClassName="edit-event-form-hour-select"
                value={eventHourValue}
                onChange={this.setEventHour}
                type="number"
                min={0}
                max={23}
              />
              :
              <NiceInput
                containerClassName="edit-event-form-minute-select"
                value={eventMinuteValue}
                onChange={this.setEventMinute}
                type="number"
                min={0}
                max={59}
              />
            </div>
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
          {isRecurring && (
            <NiceFormRow>
              <NiceInput
                checked={isStopping}
                onChange={this.setIsStopping}
                type="checkbox"
                label="Stop on…"
              />
            </NiceFormRow>
          )}
          {isStopping && (
            <NiceFormRow>
              <NiceSelect
                options={this.dayOptions({ isStopSelector: true })}
                onChange={this.setStopDatetime}
                selectedValue={eventStopDateValue}
              />
            </NiceFormRow>
          )}
          <NiceFormRow>
            <NiceInput
              value={notes}
              onChange={this.setNotes}
              placeholder="Notes (optional)"
              isFull={true}
              isTextArea={true}
            />
          </NiceFormRow>
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
          <Divider />
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
