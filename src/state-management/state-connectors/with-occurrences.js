import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchOccurrences } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withOccurrences = WrappedComponent => {
  const mapStateToProps = state => ({
    occurrences: _.pickBy(state.occurrences, ({ isDeleted }) => !isDeleted),
    allOccurrences: state.occurrences,
  });
  const mapDispatchToProps = dispatch => ({
    fetchOccurrences: ({ user }) =>
      user && dispatch(fetchOccurrences({ userId: user._id })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithOccurrences = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithOccurrences;
};

export default withOccurrences;
