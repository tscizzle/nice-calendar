const _ = require('lodash');
const moment = require('moment-timezone');

const User = require('../models/user');
const { getTimezoneFromUser } = require('../../src/common/model-methods/user');
const Event = require('../models/event');
const {
  getScheduledOccurrences,
} = require('../../src/common/model-methods/event');
const Occurrence = require('../models/occurrence');
const {
  getOccurrenceId,
} = require('../../src/common/model-methods/occurrence');
const TaskInfo = require('../models/task-info');
const { randomID } = require('../../src/common/misc-helpers');

const TASK_KEY = 'generate-occurrences';

const generateOccurrences = () => {
  const nowDatetime = new Date();

  /* Define steps (fetching various docs, generating new occurrences, etc.) */

  const getPulledUntil = taskInfoDoc => {
    const nowMoment = moment(nowDatetime);
    const dayAgoMoment = nowMoment.clone().add(-1, 'days');
    const pulledUntilMoment = taskInfoDoc
      ? moment(taskInfoDoc.taskInfo.pulledUntil)
      : dayAgoMoment;
    const pulledUntilDatetime = pulledUntilMoment
      .clone()
      .add(-1, 'minute') // sweep up the past minute in case anything was missed
      .toDate();
    return pulledUntilDatetime;
  };

  const getRelevantEvents = pulledUntilDatetime => {
    return Event.find({
      $or: [
        {
          isRecurring: true,
          datetime: { $lte: nowDatetime },
        },
        {
          isRecurring: { $ne: true },
          datetime: { $gt: pulledUntilDatetime, $lte: nowDatetime },
        },
      ],
      isDeleted: { $ne: true },
    });
  };

  const getUsersAndOccurrences = ({ pulledUntilDatetime, events }) => {
    const eventIds = _.map(events, '_id');
    const userIds = _.uniq(_.map(events, 'userId'));
    const userPromise = User.find({ _id: { $in: userIds } }).exec();
    const occurrencePromise = Occurrence.find({
      eventId: { $in: eventIds },
      datetime: { $gt: pulledUntilDatetime, $lte: nowDatetime },
    }).exec();
    return Promise.all([userPromise, occurrencePromise]);
  };

  const getNewOccurrenceDocs = ({
    pulledUntilDatetime,
    events,
    users,
    existingOccurrences,
  }) => {
    const userMap = _.keyBy(users, '_id');
    const allScheduledOccurrences = [];
    _.each(events, event => {
      const user = userMap[event.userId];
      const timezone = getTimezoneFromUser(user);
      const scheduledOccurrences = getScheduledOccurrences({
        event,
        timezone,
        start: pulledUntilDatetime,
        end: nowDatetime,
      });
      Array.prototype.push.apply(allScheduledOccurrences, scheduledOccurrences);
    });
    const existingOccurrenceMap = _.keyBy(existingOccurrences, getOccurrenceId);
    const missingOccurrences = _.reject(
      allScheduledOccurrences,
      ({ occurrence }) => {
        const occurrenceHash = getOccurrenceId(occurrence);
        const occurrenceExists = _.has(existingOccurrenceMap, occurrenceHash);
        return occurrenceExists;
      }
    );
    const newOccurrenceDocs = _.map(missingOccurrences, 'occurrence');
    return newOccurrenceDocs;
  };

  const insertNewOccurrenceDocs = newOccurrenceDocs => {
    if (!_.isEmpty(newOccurrenceDocs)) {
      return Occurrence.insertMany(newOccurrenceDocs).then(insertRes => {
        console.info(`Occurrences inserted: ${insertRes.length}`);
        return insertRes;
      });
    }
  };

  const updatePulledUntil = () => {
    return TaskInfo.findOne({
      key: TASK_KEY,
    }).then(taskInfoDoc => {
      if (taskInfoDoc) {
        return TaskInfo.updateOne(
          { key: TASK_KEY },
          { $set: { 'taskInfo.pulledUntil': nowDatetime } }
        ).exec();
      } else {
        const taskInfoId = randomID();
        const newTaskInfoDoc = {
          _id: taskInfoId,
          key: TASK_KEY,
          taskInfo: { pulledUntil: nowDatetime },
        };
        return TaskInfo.create(newTaskInfoDoc).exec();
      }
    });
  };

  const pushToUsers = newOccurrenceDocs => {
    if (!_.isEmpty(newOccurrenceDocs)) {
      const updatedUsers = _.uniq(_.map(newOccurrenceDocs, 'userId'));
      // TODO: send signal on each user's socket room to re-fetch occurrences
      // TODO: send push notification for each occurrence
    }
  };

  /* Use Promises to execute steps in the correct flow based on dependencies */

  const whenTaskInfo = TaskInfo.findOne({ key: TASK_KEY });
  const whenPulledUntil = whenTaskInfo.then(getPulledUntil);
  const whenEvents = whenPulledUntil.then(getRelevantEvents);
  const whenEventsAndPulledUntil = Promise.all([
    whenPulledUntil,
    whenEvents,
  ]).then(values => ({ pulledUntilDatetime: values[0], events: values[1] }));
  const whenUsersAndOccurrences = whenEventsAndPulledUntil
    .then(getUsersAndOccurrences)
    .then(values => ({ users: values[0], existingOccurrences: values[1] }));
  const whenNewOccurrenceDocs = Promise.all([
    whenEventsAndPulledUntil,
    whenUsersAndOccurrences,
  ])
    .then(values => ({
      pulledUntilDatetime: values[0].pulledUntilDatetime,
      events: values[0].events,
      users: values[1].users,
      existingOccurrences: values[1].existingOccurrences,
    }))
    .then(getNewOccurrenceDocs);
  const whenUpdatePulledUntil = whenNewOccurrenceDocs
    .then(insertNewOccurrenceDocs)
    .then(updatePulledUntil);
  const whenPushToUsers = Promise.all([
    whenNewOccurrenceDocs,
    whenUpdatePulledUntil,
  ])
    .then(values => values[0])
    .then(pushToUsers);

  /* Catch errors inside the Promises */

  whenPushToUsers.catch(err => {
    console.error(`Error in a generate-occurrences Promise: ${err.message}`);
  });
};

module.exports = generateOccurrences;
