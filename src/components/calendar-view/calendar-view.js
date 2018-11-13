import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';

import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withEditingEventFormData from 'state-management/state-connectors/with-editing-event-form-data';

import DayCalendar from 'components/day-calendar/day-calendar';
import WeekCalendar from 'components/week-calendar/week-calendar';
import MonthCalendar from 'components/month-calendar/month-calendar';
import EditEventForm from 'components/edit-event-form/edit-event-form';
import EventOccurrencesSummary from 'components/event-occurrences-summary/event-occurrences-summary';

import 'stylesheets/components/calendar-view/calendar-view.css';

let CalendarView = ({ selectedZoom, editingEventFormData }) => {
  const calendarComponent = {
    day: DayCalendar,
    week: WeekCalendar,
    month: MonthCalendar,
  }[selectedZoom];
  const calendar = React.createElement(calendarComponent);
  const isLeftSidebarOpened = Boolean(editingEventFormData);
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
        {editingEventFormData && <EditEventForm />}
        <div className="divider" />
        {editingEventFormData && <EventOccurrencesSummary />}
      </div>
      <div className={calendarContainerClasses}>{calendar}</div>
    </div>
  );
};

CalendarView.propTypes = {
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  editingEventFormData: PropTypes.object,
};

CalendarView = _.flow([withSelectedZoom, withEditingEventFormData])(
  CalendarView
);

export default CalendarView;
