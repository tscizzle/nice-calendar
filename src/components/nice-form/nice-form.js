import React from 'react';

import 'stylesheets/components/nice-form/nice-form.css';

export const NiceFormRow = ({ children }) => (
  <div className="nice-form-row">{children}</div>
);

export const NiceFormSubmitRow = ({ children }) => (
  <div className="nice-form-submit-row">{children}</div>
);
