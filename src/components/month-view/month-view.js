import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import moment from 'moment-timezone';
import classNames from 'classnames';

import withUser from 'state-management/state-connectors/with-user';
import withEvents from 'state-management/state-connectors/with-events';
import withOccurrences from 'state-management/state-connectors/with-occurrences';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import { userShape, getTimezoneFromUser } from 'models/user';
import { eventShape } from 'models/event';
import { occurrenceShape } from 'models/occurrence';

import 'stylesheets/components/month-view/month-view.css';

class MonthView extends Component {
  static propTypes = {
    loggedInUser: userShape.isRequired,
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
    const { loggedInUser, selectedDatetime } = this.props;
    const timezone = getTimezoneFromUser(loggedInUser);
    const selectedMoment = moment(selectedDatetime).tz(timezone);
    const start = selectedMoment.clone().startOf('month');
    const end = selectedMoment.clone().endOf('month');
    const numWeeks = end.diff(start, 'weeks') + 1;
    const weeks = _.times(numWeeks, week => {
      const containedDatetime = selectedMoment
        .clone()
        .add(week, 'weeks')
        .toDate();
      return (
        <MonthViewRow
          containedDatetime={containedDatetime}
          numWeeks={numWeeks}
          key={week}
        />
      );
    });
    return <div className="month-view-container">{weeks}</div>;
  }
}

MonthView = _.flow([
  withUser,
  withEvents,
  withOccurrences,
  withSelectedDatetime,
])(MonthView);

export default MonthView;

let MonthViewRow = ({ containedDatetime, numWeeks, loggedInUser, key }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const containedMoment = moment(containedDatetime).tz(timezone);
  const start = containedMoment.clone().startOf('week');
  const days = _.times(7, day => {
    const containedDatetime = start
      .clone()
      .add(day, 'days')
      .toDate();
    return <MonthViewCell containedDatetime={containedDatetime} key={day} />;
  });
  const numWeeksClass = `num-weeks-${numWeeks}`;
  const monthViewRowClasses = classNames('month-view-row', numWeeksClass);
  return (
    <div className={monthViewRowClasses} key={key}>
      {days}
    </div>
  );
};

MonthViewRow.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  numWeeks: PropTypes.oneOf([4, 5, 6]).isRequired,
  loggedInUser: userShape.isRequired,
};

MonthViewRow = withUser(MonthViewRow);

let MonthViewCell = ({ containedDatetime, loggedInUser, key }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const containedMoment = moment(containedDatetime).tz(timezone);
  return (
    <div className="month-view-cell" key={key}>
      <div className="month-view-cell-top">
        <span className="month-view-cell-day-number">
          {containedMoment.format('D')}
        </span>
        <span className="month-view-cell-day-name">
          {containedMoment.format('ddd')}
        </span>
      </div>
    </div>
  );
};

MonthViewCell.propTypes = {
  containedDatetime: PropTypes.instanceOf(Date).isRequired,
  loggedInUser: userShape.isRequired,
};

MonthViewCell = withUser(MonthViewCell);
