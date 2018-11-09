import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Loading from 'components/loading/loading';

import 'stylesheets/components/nice-button/nice-button.css';

const NiceButton = ({
  className,
  isPrimary,
  isSecondary,
  isCompact,
  isDisabled,
  isLoading,
  children,
  ...otherProps
}) => {
  const niceButtonClasses = classNames('nice-button', {
    [className]: Boolean(className),
    'primary-button': isPrimary,
    'secondary-button': isSecondary,
    'compact-button': isCompact,
  });
  const buttonDisabled = isDisabled || isLoading;
  return (
    <div className="nice-button-container">
      <button
        className={niceButtonClasses}
        disabled={buttonDisabled}
        {...otherProps}
      >
        <span className="nice-button-inner">
          {children}
          {isLoading && (
            <span className="button-loading">
              <Loading />
            </span>
          )}
        </span>
      </button>
    </div>
  );
};

NiceButton.propTypes = {
  className: PropTypes.string,
  isPrimary: PropTypes.bool,
  isSecondary: PropTypes.bool,
  isCompact: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default NiceButton;