import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import find from 'lodash/find';

// Import Style
import styles from '../../components/AccountListItem/AccountListItem.css';

// Import Actions
import { fetchAccount, associateUsersRequest } from '../../AccountActions';
import { fetchUsers } from '../../../User/UserActions';

// Import Selectors
import { getAccount } from '../../AccountReducer';
import { getUsers } from '../../../User/UserReducer';

class AccountDetailPage extends Component {
  componentDidMount() {
    this.props.dispatch(fetchUsers());
  }
  
  render() {
    return (
      <div>
        <Helmet title={this.props.account.email} />
        <div className={`${styles['single-account']} ${styles['account-detail']}`}>
          <h3 className={styles['account-title']}>{this.props.account.email}</h3>
          <p>Associate users with this account.</p><br />
          {this.props.users.map((user, i) => {
                    return (<Checkbox
                      key={i}
                      label={user.name}
                      style={styles.checkbox}
                      defaultUnChecked
                      ref={user._id}
                    />);
                  })}<br />
            <a className={styles['account-submit-button']} href="#" onClick={this.associateUsers}><FormattedMessage id="submit" /></a>
        </div>
      </div>
    );
  }

  associateUsers = () => {
    const refs = this.refs;
    const usersRef = find(this.props.users, (user) => {
      if (refs[user._id].isChecked()) {
        return user._id;
      }
    });
    if (usersRef) {
      this.props.dispatch(associateUsersRequest({ users: usersRef || [], cuid: this.props.account.cuid }));
    }
  }
}

// Actions required to provide data for this component to render in sever side.
AccountDetailPage.need = [params => {
  return fetchAccount(params.cuid);
},
  () => { return fetchUsers(); }
];

// Retrieve data from store as props
function mapStateToProps(state, props) {
  return {
    account: getAccount(state, props.params.cuid),
    users: getUsers(state),
  };
}

AccountDetailPage.propTypes = {
  account: PropTypes.shape({
    email: PropTypes.string.isRequired,
    cuid: PropTypes.string.isRequired,
  }).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  })).isRequired,
};

export default connect(mapStateToProps)(AccountDetailPage);
