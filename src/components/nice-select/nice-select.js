import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    onChange: PropTypes.func.isRequired,
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
          {!isBare && (
            <FontAwesomeIcon icon="caret-down" className="nice-select-icon" />
          )}
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
    'is-selected': isSelected,
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
  onChange: PropTypes.func.isRequired,
  toggleIsOpen: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export class NiceSelectButtons extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  render() {
    const { options, onChange, selectedValue } = this.props;
    const optionButtons = _.map(options, ({ value, label }) => {
      const isSelected = value === selectedValue;
      return (
        <NiceSelectOptionButton
          value={value}
          label={label}
          onChange={onChange}
          isSelected={isSelected}
          key={value}
        />
      );
    });
    return <div className="nice-select-buttons-container">{optionButtons}</div>;
  }
}

const NiceSelectOptionButton = ({ value, label, onChange, isSelected }) => {
  const selectValue = () => onChange({ value });
  const display = !_.isUndefined(label) ? label : value;
  const niceSelectOptionButtonClasses = classNames(
    'nice-select-buttons-option',
    {
      'is-selected': isSelected,
    }
  );
  return (
    <div
      className={niceSelectOptionButtonClasses}
      onClick={selectValue}
      datatext={display}
    >
      {display}
    </div>
  );
};

NiceSelectOptionButton.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  isSelected: PropTypes.bool.isRequired,
};
