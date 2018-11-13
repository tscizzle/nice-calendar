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
    const start = selectedMoment.clone().startOf('day');
    const end = selectedMoment.clone().endOf('day');
    return (
      <div className="day-calendar-container">
        Day View ({start.format()} - {end.format()})
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
