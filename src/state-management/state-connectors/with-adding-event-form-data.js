import { connect } from 'react-redux';

import { setAddingEventFormData } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withAddingEventFormData = WrappedComponent => {
  const mapStateToProps = state => ({
    addingEventFormData: state.addingEventFormData,
  });
  const mapDispatchToProps = dispatch => ({
    setAddingEventFormData: ({ event }) =>
      dispatch(setAddingEventFormData({ event })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithAddingEventFormData = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithAddingEventFormData;
};

export default withAddingEventFormData;
