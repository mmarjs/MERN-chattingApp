import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

// Import Style
import styles from './AccountCreateWidget.css';

export class AccountCreateWidget extends Component {
  addAccount = () => {
    const emailRef = this.refs.email;
    const passwordRef = this.refs.password;
    if (emailRef.value && passwordRef.value) {
      this.props.addAccount(emailRef.value, passwordRef.value);
      emailRef.value = passwordRef.value = '';
    }
  };

  render() {
    return (
      <div className={styles.appear}>
        <div className={styles['form-content']}>
          <h2 className={styles['form-title']}>Create New Account</h2>
          <input placeholder='E-mail' className={styles['form-field']} ref="email" />
          <input placeholder='Password' className={styles['form-field']} type="password" ref="password" />
          <a className={styles['account-submit-button']} href="#" onClick={this.addAccount}><FormattedMessage id="submit" /></a>
        </div>
      </div>
    );
  }
}

AccountCreateWidget.propTypes = {
  addAccount: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(AccountCreateWidget);
