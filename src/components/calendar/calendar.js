import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import _ from 'lodash';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import { userShape } from 'models/user';

import DayView from 'components/day-view/day-view';
import WeekView from 'components/week-view/week-view';
import MonthView from 'components/month-view/month-view';

import 'stylesheets/components/calendar/calendar.css';

class Calendar extends Component {
  static propTypes = {
    selectedDatetime: PropTypes.instanceOf(Date).isRequired,
    loggedInUser: userShape,
    selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    setSelectedZoom: PropTypes.func.isRequired,
  };

  componentMap = {
    day: DayView,
    week: WeekView,
    month: MonthView,
  };

  onSelectZoom = event => {
    const { setSelectedZoom } = this.props;
    setSelectedZoom({ zoom: event.target.value });
  };

  render() {
    const { selectedDatetime, loggedInUser, selectedZoom } = this.props;
    const calendarComponent = this.componentMap[selectedZoom];
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
    const zoomOptions = _.map(zooms, ({ value, label }) => (
      <option value={value} key={value}>
        {label}
      </option>
    ));
    return (
      <div>
        <select value={selectedZoom} onChange={this.onSelectZoom}>
          {zoomOptions}
        </select>
        {loggedInUser && <div className="calendar-container">{calendar}</div>}
      </div>
    );
  }
}

Calendar = _.flow([withUser, withEvents, withSelectedZoom])(Calendar);

export default Calendar;
