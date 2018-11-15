import _ from 'lodash';
import { connect } from 'react-redux';

import { setEditingEventFormData } from 'state-management/actions';
import { preserveOwnProps } from 'state-management/helpers';

const withEditingEventFormData = WrappedComponent => {
  const mapStateToProps = state => {
    const { events, editingEventFormData } = state;
    const editingEventId = _.get(editingEventFormData, '_id');
    const isEditingExistingEvent = _.has(events, editingEventId);
    return {
      editingEventFormData,
      isEditingExistingEvent,
    };
  };
  const mapDispatchToProps = dispatch => ({
    setEditingEventFormData: ({ event }) =>
      dispatch(setEditingEventFormData({ event })),
  });
  const mergeProps = preserveOwnProps;
  const ComponentWithEditingEventFormData = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(WrappedComponent);
  return ComponentWithEditingEventFormData;
};

export default withEditingEventFormData;
