import React from 'react';

import logo from 'components/app/images/calendar.svg';

import 'stylesheets/components/topbar/topbar.css';

const Topbar = () => {
  return (
    <div className="topbar">
      <img className="topbar-logo" src={logo} alt="" />
    </div>
  );
};

export default Topbar;
