import React from 'react';
import PropTypes from 'prop-types';

import 'components/nice-form/nice-form.scss';

export const NiceFormRow = ({ children }) => (
  <div className="nice-form-row">{children}</div>
);

export const NiceFormSubmitRow = ({ children }) => (
  <div className="nice-form-submit-row">{children}</div>
);

export let NiceFormErrorMsg = ({ errorMsg }) => (
  <div className="nice-form-error-msg">{errorMsg}</div>
);

NiceFormErrorMsg.propTypes = {
  errorMsg: PropTypes.string.isRequired,
};
