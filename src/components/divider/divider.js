import React from 'react';
import classNames from 'classnames';

import 'stylesheets/components/divider/divider.css';

const Divider = ({ addMargin }) => {
  const dividerClasses = classNames('divider', { 'add-margin': addMargin });
  return <div className={dividerClasses} />;
};

export default Divider;
