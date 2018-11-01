import { connect } from 'react-redux';

import { setSelectedZoom } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withSelectedZoom = WrappedComponent => {
  const mapStateToProps = state => ({
    selectedZoom: state.selectedZoom,
  });
  const mapDispatchToProps = dispatch => ({
    setSelectedZoom: ({ zoom }) => dispatch(setSelectedZoom({ zoom })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithSelectedZoom = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithSelectedZoom;
};

export default withSelectedZoom;
