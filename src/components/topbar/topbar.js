import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

import withSelectedZoom from 'state-management/state-connectors/with-selected-zoom';
import logo from 'components/app/images/calendar.svg';

import 'stylesheets/components/topbar/topbar.css';

const Topbar = () => {
  return (
    <div className="topbar">
      <img className="topbar-logo" src={logo} alt="" />
      <ZoomSelector />
    </div>
  );
};

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
      onChange={event => setSelectedZoom({ zoom: event.target.value })}
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
