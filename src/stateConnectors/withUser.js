import { connect } from 'react-redux';

import { fetchUser } from '../actions';
import { preserveOwnProps } from './helpers';

const withUser = WrappedComponent => {
  const mapStateToProps = state => ({
    loggedInUser: state.loggedInUser,
  });
  const mapDispatchToProps = dispatch => ({
    fetchUser: () => dispatch(fetchUser()),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithUser = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithUser;
};

export default withUser;
