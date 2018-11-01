import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import _ from 'lodash';
import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import { chainWrap } from 'state-management/helpers';
import { userShape, getTimezoneFromUser } from 'models/user';
import { eventShape, getScheduledDatetimes } from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import 'stylesheets/components/calendar/calendar.css';

class Calendar extends Component {
  static propTypes = {
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    loggedInUser: userShape,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    setSelectedZoom: PropTypes.func.isRequired,
  };

  render() {
    const {
      selectedDatetime,
      loggedInUser,
      selectedZoom,
      setSelectedZoom,
    } = this.props;
    const componentMap = {
      day: DayView,
      week: WeekView,
      month: MonthView,
    };
    const calendarComponent = componentMap[selectedZoom];
    const calendar = loggedInUser
      ? React.createElement(calendarComponent, {
          selectedDatetime,
          loggedInUser,
        })
      : null;
    const zooms = [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ];
    const onSelectZoom = event => {
      setSelectedZoom({ zoom: event.target.value });
    };
    return (
      <div>
        <select value={selectedZoom} onChange={onSelectZoom}>
          {_.map(zooms, ({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        {loggedInUser && <div className="calendar-container">{calendar}</div>}
      </div>
    );
  }
}

Calendar = chainWrap(Calendar, [withUser, withEvents, withSelectedZoom]);

export default Calendar;

class DayView extends Component {
  static propTypes = {
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    loggedInUser: userShape.isRequired,
    events: PropTypes.arrayOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    occurrences: PropTypes.arrayOf(occurrenceShape).isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { selectedDatetime, loggedInUser, events, occurrences } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const start = selectedMoment.clone().startOf('day');
    const end = selectedMoment.clone().endOf('day');
    return (
      <div className="day-view-container">
        Day View ({start.format()} - {end.format()})
      </div>
    );
  }
}

DayView = chainWrap(DayView, [withUser, withEvents, withOccurrences]);

class WeekView extends Component {
  static propTypes = {
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    loggedInUser: userShape.isRequired,
    events: PropTypes.arrayOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    occurrences: PropTypes.arrayOf(occurrenceShape).isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { selectedDatetime, loggedInUser, events, occurrences } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const start = selectedMoment.clone().startOf('week');
    const end = selectedMoment.clone().endOf('week');
    return (
      <div className="week-view-container">
        Week View ({start.format()} - {end.format()})
      </div>
    );
  }
}

WeekView = chainWrap(WeekView, [withUser, withEvents, withOccurrences]);

class MonthView extends Component {
  static propTypes = {
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    loggedInUser: userShape.isRequired,
    events: PropTypes.arrayOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    occurrences: PropTypes.arrayOf(occurrenceShape).isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { selectedDatetime, loggedInUser, events, occurrences } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const start = selectedMoment.clone().startOf('month');
    const end = selectedMoment.clone().endOf('month');
    const occurrenceDatetimes = _.map(
      _.flatten(
        _.map(events, event =>
          getScheduledDatetimes({
            event,
            timezone,
            start: start.toDate(),
            end: end.toDate(),
          })
        )
      ),
      dt => {
        return (
          <div key={Math.random()}>
            {moment(dt)
              .tz(timezone)
              .format()}
          </div>
        );
      }
    );
    return (
      <div className="month-view-container">
        Month View ({start.format()} - {end.format()})
        <div>{occurrenceDatetimes}</div>
      </div>
    );
  }
}

MonthView = chainWrap(MonthView, [withUser, withEvents, withOccurrences]);
