import { connect } from 'react-redux';

import { fetchUser } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

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
