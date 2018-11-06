import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

import withUser from 'state-management/state-connectors/with-user';
import withSelectedDatetime from 'state-management/state-connectors/with-selected-datetime';
import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import { userShape, getTimezoneFromUser } from 'models/user';
import logo from 'components/app/images/calendar.svg';

import 'stylesheets/components/topbar/topbar.css';

let Topbar = ({ loggedInUser, selectedDatetime }) => {
  const timezone = getTimezoneFromUser(loggedInUser);
  const selectedMoment = moment(selectedDatetime).tz(timezone);
  return (
    <div className="topbar">
      <img className="topbar-logo" src={logo} alt="" />
      <div>
        <ZoomSelector /> of {selectedMoment.format('YYYY-MM-DD')}
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

let ZoomSelector = ({ selectedZoom, setSelectedZoom }) => {
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
    <select
      value={selectedZoom}
      onChange={evt => setSelectedZoom({ zoom: evt.target.value })}
    >
      {zoomOptions}
    </select>
  );
};

ZoomSelector.propTypes = {
  selectedZoom: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  setSelectedZoom: PropTypes.func.isRequired,
};

ZoomSelector = withSelectedZoom(ZoomSelector);
