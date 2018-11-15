import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import withUser from 'state-management/state-connectors/with-user';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import NiceButton from 'components/nice-button/nice-button';
import NiceSelect from 'components/nice-select/nice-select';
import logo from 'components/app/images/calendar.svg';

import 'stylesheets/components/topbar/topbar.css';

let Topbar = ({ timezone, selectedDatetime, selectedZoom }) => {
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const windowStart = selectedMoment.clone().startOf(selectedZoom);
  const windowEnd = selectedMoment.clone().endOf(selectedZoom);
  const monthDisplay = windowEnd.isSame(windowStart, 'month')
    ? selectedMoment.format('MMMM YYYY')
    : `${windowStart.format('MMM')} - ${windowEnd.format(
        'MMM'
      )} ${windowEnd.format('YYYY')}`;
  return (
    <div className="topbar">
      <img className="topbar-logo" src={logo} alt="" />
      <div className="topbar-right">
        <div className="topbar-calendar-control">
          <TodayShortcut />
          <ZoomSelector />
          <DatetimePager />
        </div>
        <div className="topbar-selected-month">{monthDisplay}</div>
      </div>
    </div>
  );
};

Topbar.propTypes = {
  timezone: PropTypes.string,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
};

Topbar = _.flow([withUser, withSelectedDatetime, withSelectedZoom])(Topbar);

export default Topbar;

let TodayShortcut = ({ setSelectedDatetime, nowMinute }) => {
  const selectToday = () => setSelectedDatetime({ datetime: nowMinute });
  return (
    <NiceButton onClick={selectToday} isCompact={true}>
      <div className="today-button-dot" />
      Today
    </NiceButton>
  );
};

TodayShortcut.propTypes = {
  setSelectedDatetime: PropTypes.func.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

TodayShortcut = _.flow([withSelectedDatetime, withNowMinute])(TodayShortcut);

let ZoomSelector = ({ selectedZoom, setSelectedZoom }) => {
  const zoomOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];
  const handleChange = ({ value }) => setSelectedZoom({ zoom: value });
  return (
    <NiceSelect
      options={zoomOptions}
      onChange={handleChange}
      selectedValue={selectedZoom}
    />
  );
};

ZoomSelector.propTypes = {
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  setSelectedZoom: PropTypes.func.isRequired,
};

ZoomSelector = withSelectedZoom(ZoomSelector);

let DatetimePager = ({
  timezone,
  selectedDatetime,
  setSelectedDatetime,
  selectedZoom,
}) => {
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const getPageFunc = ({ direction }) => () => {
    const datetime = selectedMoment
      .clone()
      .add(direction, selectedZoom)
      .toDate();
    setSelectedDatetime({ datetime });
  };
  const goToPreviousPage = getPageFunc({ direction: -1 });
  const goToNextPage = getPageFunc({ direction: 1 });
  return (
    <div className="datetime-pager">
      <div className="datetime-pager-button" onClick={goToPreviousPage}>
        <FontAwesomeIcon icon="angle-left" className="previous-page-icon" />
      </div>
      <div className="datetime-pager-button" onClick={goToNextPage}>
        <FontAwesomeIcon icon="angle-right" className="next-page-icon" />
      </div>
    </div>
  );
};

DatetimePager.propTypes = {
  timezone: PropTypes.string,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  setSelectedDatetime: PropTypes.func.isRequired,
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
};

DatetimePager = _.flow([withUser, withSelectedDatetime, withSelectedZoom])(
  DatetimePager
);
