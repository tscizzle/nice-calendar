import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';

import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withAddingEventFormData from 'state-management/state-connectors/with-adding-event-form-data';

import DayCalendar from 'components/day-calendar/day-calendar';
import WeekCalendar from 'components/week-calendar/week-calendar';
import MonthCalendar from 'components/month-calendar/month-calendar';
import AddEventForm from 'components/add-event-form/add-event-form';

import 'stylesheets/components/calendar-view/calendar-view.css';

let CalendarView = ({ selectedZoom, addingEventFormData }) => {
  const calendarComponent = {
    day: DayCalendar,
    week: WeekCalendar,
    month: MonthCalendar,
  }[selectedZoom];
  const calendar = React.createElement(calendarComponent);
  const isLeftSidebarOpened = Boolean(addingEventFormData);
  const calendarContainerClasses = classNames('calendar-container', {
    'left-sidebar-opened': isLeftSidebarOpened,
  });
  const calendarViewLeftSidebarClasses = classNames(
    'calendar-view-left-sidebar',
    { opened: isLeftSidebarOpened }
  );
  return (
    <div className="calendar-view-container">
      <div className={calendarViewLeftSidebarClasses}>
        {addingEventFormData && <AddEventForm />}
      </div>
      <div className={calendarContainerClasses}>{calendar}</div>
    </div>
  );
};

CalendarView.propTypes = {
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  addingEventFormData: PropTypes.object,
};

CalendarView = _.flow([withSelectedZoom, withAddingEventFormData])(
  CalendarView
);

export default CalendarView;
