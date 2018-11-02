import { connect } from 'react-redux';

import { setSelectedDatetime } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withSelectedDatetime = WrappedComponent => {
  const mapStateToProps = state => ({
    selectedDatetime: state.selectedDatetime,
  });
  const mapDispatchToProps = dispatch => ({
    setSelectedDatetime: ({ datetime }) =>
      dispatch(setSelectedDatetime({ datetime })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithSelectedDatetime = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithSelectedDatetime;
};

export default withSelectedDatetime;
