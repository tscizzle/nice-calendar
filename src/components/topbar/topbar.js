import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

import withUser from 'state-management/state-connectors/with-user';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import withNowMinute from 'state-management/state-connectors/with-now-minute';
import { userShape, getTimezoneFromUser } from 'models/user';
import NiceButton from 'components/nice-button/nice-button';
import NiceSelect from 'components/nice-select/nice-select';
import logo from 'components/app/images/calendar.svg';

import 'stylesheets/components/topbar/topbar.css';

let Topbar = ({ loggedInUser, selectedDatetime }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  return (
    <div className="topbar">
      <img className="topbar-logo" src={logo} alt="" />
      <div className="topbar-right">
        <div className="topbar-calendar-control">
          <TodayShortcut />
          <ZoomSelector />
          <DatetimePager />
        </div>
        <div className="topbar-selected-month">
          {selectedMoment.format('MMMM YYYY')}
        </div>
      </div>
    </div>
  );
};

Topbar.propTypes = {
  loggedInUser: userShape,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
};

Topbar = _.flow([withUser, withSelectedDatetime])(Topbar);

export default Topbar;

let TodayShortcut = ({
  loggedInUser,
  selectedDatetime,
  setSelectedDatetime,
  nowMinute,
}) => {
  const selectToday = () => setSelectedDatetime({ datetime: nowMinute });
  const timezone = getTimezoneFromUser(loggedInUser);
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  const nowMoment = moment(nowMinute).tz(timezone);
  const isTodaySelected = selectedMoment.isSame(nowMoment, 'day');
  return (
    <NiceButton
      onClick={selectToday}
      isCompact={true}
      isDisabled={isTodaySelected}
    >
      Today
    </NiceButton>
  );
};

TodayShortcut.propTypes = {
  loggedInUser: userShape,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  setSelectedDatetime: PropTypes.func.isRequired,
  nowMinute: PropTypes.instanceOf(Date).isRequired,
};

TodayShortcut = _.flow([withUser, withSelectedDatetime, withNowMinute])(
  TodayShortcut
);

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
  loggedInUser,
  selectedDatetime,
  setSelectedDatetime,
  selectedZoom,
}) => {
  const timezone = getTimezoneFromUser(loggedInUser);
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
        <FaAngleLeft className="previous-page-icon" />
      </div>
      <div className="datetime-pager-button" onClick={goToNextPage}>
        <FaAngleRight className="next-page-icon" />
      </div>
    </div>
  );
};

DatetimePager.propTypes = {
  loggedInUser: userShape,
  selectedDatetime: PropTypes.instanceOf(Date).isRequired,
  setSelectedDatetime: PropTypes.func.isRequired,
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
};

DatetimePager = _.flow([withUser, withSelectedDatetime, withSelectedZoom])(
  DatetimePager
);
