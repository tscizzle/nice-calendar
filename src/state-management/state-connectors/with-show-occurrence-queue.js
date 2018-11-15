import { connect } from 'react-redux';

import { setShowOccurrenceQueue } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withShowOccurrenceQueue = WrappedComponent => {
  const mapStateToProps = state => {
    const { showOccurrenceQueue } = state;
    return {
      showOccurrenceQueue,
    };
  };
  const mapDispatchToProps = dispatch => ({
    setShowOccurrenceQueue: ({ show }) =>
      dispatch(setShowOccurrenceQueue({ show })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithShowOccurrenceQueue = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithShowOccurrenceQueue;
};

export default withShowOccurrenceQueue;
