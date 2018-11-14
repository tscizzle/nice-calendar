import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment-timezone';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import { userShape } from 'models/user';
import { eventShape } from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import CalendarCell from 'components/calendar-cell/calendar-cell';

import 'stylesheets/components/day-calendar/day-calendar.css';

class DayCalendar extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
    timezone: PropTypes.string.isRequired,
    events: PropTypes.objectOf(eventShape).isRequired,
    fetchEvents: PropTypes.func.isRequired,
    occurrences: PropTypes.objectOf(occurrenceShape).isRequired,
    fetchOccurrences: PropTypes.func.isRequired,
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  };

  componentDidMount() {
    const { loggedInUser, fetchEvents, fetchOccurrences } = this.props;
    fetchEvents({ user: loggedInUser });
    fetchOccurrences({ user: loggedInUser });
  }

  render() {
    const { timezone, selectedDatetime } = this.props;
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const dayStartMoment = selectedMoment.clone().startOf('day');
    const DAY_CHUNK_WINDOWS = _.times(8, idx => ({
      startHour: idx * 3,
      endHour: idx * 3 + 2,
    }));
    const hours = _.map(DAY_CHUNK_WINDOWS, ({ startHour, endHour }) => {
      const startDatetime = dayStartMoment
        .clone()
        .add(startHour, 'hours')
        .toDate();
      const endDatetime = dayStartMoment
        .clone()
        .add(endHour, 'hours')
        .endOf('hour')
        .toDate();
      return (
        <div className="day-calendar-row" key={startHour}>
          <CalendarCell
            startDatetime={startDatetime}
            endDatetime={endDatetime}
            topLeftFormat="HH:mm"
            isFlowHorizontal={true}
            className="day-calendar-cell"
          />
        </div>
      );
    });
    return (
      <div className="day-calendar-container">
        <div className="day-calendar-top">
          {selectedMoment.format('YYYY-MM-DD')}
        </div>
        <div className="day-calendar-content">{hours}</div>
      </div>
    );
  }
}

DayCalendar = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
])(DayCalendar);

export default DayCalendar;
