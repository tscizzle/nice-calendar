import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchEvents } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withEvents = WrappedComponent => {
  const mapStateToProps = state => ({
    events: _.pickBy(state.events, ({ isDeleted }) => !isDeleted),
    allEvents: state.events,
  });
  const mapDispatchToProps = dispatch => ({
    fetchEvents: ({ user }) =>
      user && dispatch(fetchEvents({ userId: user._id })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithEvents = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithEvents;
};

export default withEvents;
