import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import 'stylesheets/components/nice-input/nice-input.css';

class NiceInput extends Component {
  static propTypes = {
    containerClassName: PropTypes.string,
    inputClassName: PropTypes.string,
    isFull: PropTypes.bool,
    isBare: PropTypes.bool,
    isBold: PropTypes.bool,
    focusOnMount: PropTypes.bool,
  };

  state = {
    hasFocusedOnMount: false,
  };

  refFuncThatFocusesOnMount = input => {
    const { hasFocusedOnMount } = this.state;
    if (!hasFocusedOnMount) {
      input && input.focus();
      this.setState({ hasFocusedOnMount: true });
    }
  };

  render() {
    const {
      containerClassName,
      inputClassName,
      isFull,
      isBare,
      isBold,
      focusOnMount,
      ...otherProps
    } = this.props;
    const containerClasses = classNames('nice-input-container', {
      [containerClassName]: Boolean(containerClassName),
      'full-input-container': isFull,
    });
    const inputClasses = classNames('nice-input', {
      [inputClassName]: Boolean(inputClassName),
      'bare-input': isBare,
      'bold-input': isBold,
    });
    return (
      <div className={containerClasses}>
        <input
          className={inputClasses}
          {...otherProps}
          {...focusOnMount && { ref: this.refFuncThatFocusesOnMount }}
        />
      </div>
    );
  }
}

export default NiceInput;
