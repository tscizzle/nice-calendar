import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { FaCaretDown } from 'react-icons/fa';
import enhanceWithClickOutside from 'react-click-outside';

import 'stylesheets/components/nice-select/nice-select.css';

class NiceSelect extends Component {
  static propTypes = {
    containerClassName: PropTypes.string,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        labelWhenSelected: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
      })
    ).isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isBare: PropTypes.bool,
  };

  state = {
    isOpen: false,
  };

  toggleIsOpen = () => this.setState({ isOpen: !this.state.isOpen });

  close = () => this.setState({ isOpen: false });

  handleClickOutside = () => this.close();

  escFunction = evt => evt.keyCode === 27 && this.close();

  componentDidMount() {
    document.addEventListener('keydown', this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  render() {
    const {
      containerClassName,
      options,
      onChange,
      selectedValue,
      isBare,
      ...otherProps
    } = this.props;
    const { isOpen } = this.state;
    const selectedOption = _.find(options, { value: selectedValue });
    let selectedLabel;
    if (selectedOption) {
      const { value, label, labelWhenSelected } = selectedOption;
      if (!_.isUndefined(labelWhenSelected)) {
        selectedLabel = labelWhenSelected;
      } else if (!_.isUndefined(label)) {
        selectedLabel = label;
      } else {
        selectedLabel = value;
      }
    } else {
      selectedLabel = 'Select Option';
    }
    const selectOptions = _.map(
      options,
      ({ value, label, labelWhenSelected }) => {
        const isSelected = value === selectedValue;
        return (
          <NiceSelectOption
            value={value}
            label={label}
            onChange={onChange}
            toggleIsOpen={this.toggleIsOpen}
            isSelected={isSelected}
            key={value}
          />
        );
      }
    );
    const niceSelectContainerClasses = classNames('nice-select-container', {
      [containerClassName]: Boolean(containerClassName),
    });
    const niceSelectClasses = classNames('nice-select', {
      'nice-select-open': isOpen,
      'bare-select': isBare,
    });
    return (
      <div className={niceSelectContainerClasses}>
        <div
          className={niceSelectClasses}
          onClick={this.toggleIsOpen}
          {...otherProps}
        >
          {selectedLabel}
          {!isBare && <FaCaretDown className="nice-select-icon" />}
        </div>
        {isOpen && (
          <div className="nice-select-options-container">{selectOptions}</div>
        )}
      </div>
    );
  }
}

NiceSelect = enhanceWithClickOutside(NiceSelect);

export default NiceSelect;

const NiceSelectOption = ({
  value,
  label,
  onChange,
  toggleIsOpen,
  isSelected,
}) => {
  const selectValue = () => {
    onChange({ value });
    toggleIsOpen();
  };
  const display = !_.isUndefined(label) ? label : value;
  const niceSelectOptionClasses = classNames('nice-select-option', {
    'nice-select-option-selected': isSelected,
  });
  return (
    <div className={niceSelectOptionClasses} onClick={selectValue}>
      {display}
    </div>
  );
};

NiceSelectOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  toggleIsOpen: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};
