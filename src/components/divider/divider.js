import React from 'react';
import classNames from 'classnames';

import 'components/divider/divider.scss';

const Divider = ({ addMargin }) => {
  const dividerClasses = classNames('divider', { 'add-margin': addMargin });
  return <div className={dividerClasses} />;
};

export default Divider;
