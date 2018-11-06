import { connect } from 'react-redux';

import { updateNowMinute } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withNowMinute = WrappedComponent => {
  const mapStateToProps = state => ({
    nowMinute: state.nowMinute,
  });
  const mapDispatchToProps = dispatch => ({
    updateNowMinute: () => dispatch(updateNowMinute()),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithNowMinute = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithNowMinute;
};

export default withNowMinute;
