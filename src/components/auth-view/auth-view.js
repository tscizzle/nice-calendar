import React, { Component } from 'react';
import PropTypes from 'prop-types';

import api from 'api';
import withUser from 'state-management/state-connectors/with-user';

import {
  NiceFormRow,
  NiceFormSubmitRow,
  NiceFormErrorMsg,
} from 'components/nice-form/nice-form';
import NiceInput from 'components/nice-input/nice-input';
import NiceButton, { LinkButton } from 'components/nice-button/nice-button';
import logo from 'assets/images/calendar.svg';

import 'stylesheets/components/auth-view/auth-view.css';

class AuthView extends Component {
  state = {
    currentAuthView: 'login',
  };

  render() {
    const { currentAuthView } = this.state;
    return (
      <div className="auth-view-container">
        <div className="center-form">
          <div className="auth-form-brand">
            <img className="auth-form-brand-logo" src={logo} alt="" />
          </div>
          {currentAuthView === 'login' && <LoginForm />}
          <div className="copyright-footer">&copy; 2019, Nice Calendar</div>
        </div>
      </div>
    );
  }
}

export default AuthView;

class LoginForm extends Component {
  static propTypes = {
    fetchUser: PropTypes.func.isRequired,
  };

  state = {
    loginOrRegister: 'login',
    email: '',
    password: '',
    confirmPassword: '',
    errorFromFormValidation: null,
    errorFromServer: null,
    hasAttemptedSubmit: false,
  };

  handleChangeEmail = evt => this.setState({ email: evt.target.value });

  handleChangePassword = evt => this.setState({ password: evt.target.value });

  handleChangeConfirmPassword = evt => {
    this.setState({ confirmPassword: evt.target.value });
  };

  getFormTitle = () => {
    const { loginOrRegister } = this.state;
    return {
      login: 'Login',
      register: 'Register',
    }[loginOrRegister];
  };

  getSwitchFormText = () => {
    const { loginOrRegister } = this.state;
    return {
      login: 'No account? Register here.',
      register: 'Already registered? Login here.',
    }[loginOrRegister];
  };

  getButtonText = () => {
    const { loginOrRegister } = this.state;
    return { login: 'Login', register: 'Register' }[loginOrRegister];
  };

  validateLoginInputs = ({ email, password }) => {
    if (!email) {
      return 'Fill in the email field.';
    } else if (!password) {
      return 'Fill in the password field.';
    } else {
      return '';
    }
  };

  validateRegisterInputs = ({ email, password, confirmPassword }) => {
    // TODO: also make sure the email is of email format
    if (!email) {
      return 'Fill in the email field.';
    } else if (!password) {
      return 'Fill in the password field.';
    } else if (password.length < 8) {
      return 'Give your password at least 8 characters.';
    } else if (password !== confirmPassword) {
      return 'Make sure your password confirmation matches your password.';
    } else {
      return '';
    }
  };

  getValidationFunc = () => {
    const { loginOrRegister } = this.state;
    return {
      login: this.validateLoginInputs,
      register: this.validateRegisterInputs,
    }[loginOrRegister];
  };

  getApiCall = () => {
    const { loginOrRegister } = this.state;
    return {
      login: api.login,
      register: api.register,
    }[loginOrRegister];
  };

  handleSubmit = () => {
    this.setState({ hasAttemptedSubmit: true }, () => {
      const { fetchUser } = this.props;
      const { email, password, confirmPassword } = this.state;
      const validationFunc = this.getValidationFunc();
      const apiCall = this.getApiCall();
      const validationErrorMsg = validationFunc({
        email,
        password,
        confirmPassword,
      });
      if (!validationErrorMsg) {
        apiCall({ email, password }).then(({ err }) => {
          if (err) {
            this.setState({ errorFromServer: err });
          } else {
            fetchUser();
          }
        });
      }
    });
  };

  toggleForm = () => {
    const { loginOrRegister } = this.state;
    const newForm = { login: 'register', register: 'login' }[loginOrRegister];
    this.setState({
      loginOrRegister: newForm,
      hasAttemptedSubmit: false,
    });
  };

  render() {
    const {
      loginOrRegister,
      email,
      password,
      confirmPassword,
      hasAttemptedSubmit,
      errorFromServer,
    } = this.state;
    const formTitle = this.getFormTitle();
    const switchFormText = this.getSwitchFormText();
    const buttonText = this.getButtonText();
    const validationFunc = this.getValidationFunc();
    const validationErrorMsg = validationFunc({
      email,
      password,
      confirmPassword,
    });
    const errorMsg = validationErrorMsg || errorFromServer;
    const isError = hasAttemptedSubmit && Boolean(errorMsg);
    return (
      <div className="auth-form">
        <NiceFormRow>
          <div className="auth-form-title">{formTitle}</div>
        </NiceFormRow>
        <NiceFormRow>
          <NiceInput
            value={email}
            onChange={this.handleChangeEmail}
            placeholder="Email"
            isFull={true}
          />
        </NiceFormRow>
        <NiceFormRow>
          <NiceInput
            value={password}
            onChange={this.handleChangePassword}
            type="password"
            placeholder="Password"
            isFull={true}
          />
        </NiceFormRow>
        {loginOrRegister === 'register' && (
          <NiceFormRow>
            <NiceInput
              value={confirmPassword}
              onChange={this.handleChangeConfirmPassword}
              type="password"
              placeholder="Confirm Password"
              isFull={true}
            />
          </NiceFormRow>
        )}
        <NiceFormSubmitRow>
          <NiceButton isPrimary={true} onClick={this.handleSubmit}>
            {buttonText}
          </NiceButton>
          <LinkButton onClick={this.toggleForm}>{switchFormText}</LinkButton>
          {isError && <NiceFormErrorMsg errorMsg={errorMsg} />}
        </NiceFormSubmitRow>
      </div>
    );
  }
}

LoginForm = withUser(LoginForm);
