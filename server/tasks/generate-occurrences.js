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

const generateOccurrences = async () => {
  const nowDatetime = new Date();
  const nowMoment = moment(nowDatetime);
  const dayAgoMoment = nowMoment.clone().add(-1, 'days');
  const taskInfoDoc = await TaskInfo.findOne({
    key: 'generate-occurrences',
  }).exec();
  const pulledUntilMoment = taskInfoDoc
    ? moment(taskInfoDoc.taskInfo.pulledUntil)
    : dayAgoMoment;
  const pulledUntilDatetime = pulledUntilMoment.toDate();
  const recurringEvents = await Event.find({
    isRecurring: true,
    datetime: { $lte: nowDatetime },
    isDeleted: { $ne: true },
  }).exec();
  const singleEvents = await Event.find({
    isRecurring: { $ne: true },
    datetime: { $gt: pulledUntilDatetime, $lte: nowDatetime },
    isDeleted: { $ne: true },
  }).exec();
  const allEvents = _.concat(recurringEvents, singleEvents);
  const eventIds = _.map(allEvents, '_id');
  const userIds = _.uniq(_.map(allEvents, 'userId'));
  const users = await User.find({ _id: { $in: userIds } }).exec();
  const userMap = _.keyBy(users, '_id');
  const allScheduledOccurrences = [];
  _.each(allEvents, event => {
    const user = userMap[event.userId];
    const timezone = getTimezoneFromUser(user);
    const scheduledOccurrences = getScheduledOccurrences({
      event,
      timezone,
      start: pulledUntilDatetime,
      end: nowDatetime,
      now: new Date('1971-01-01'), // don't want to filter to only future occurrences
    });
    Array.prototype.push.apply(allScheduledOccurrences, scheduledOccurrences);
  });
  const existingOccurrences = await Occurrence.find({
    eventId: { $in: eventIds },
    datetime: { $gt: pulledUntilDatetime, $lte: nowDatetime },
  }).exec();
  const hashOccurrence = occurrence => {
    return getOccurrenceId({
      eventId: occurrence.eventId,
      datetime: occurrence.datetime,
    });
  };
  const existingOccurrenceMap = _.keyBy(existingOccurrences, hashOccurrence);
  const missingOccurrences = _.reject(
    allScheduledOccurrences,
    ({ occurrence }) => {
      const occurrenceHash = hashOccurrence(occurrence);
      const occurrenceExists = _.has(existingOccurrenceMap, occurrenceHash);
      return occurrenceExists;
    }
  );
  const newOccurrenceDocs = _.map(missingOccurrences, 'occurrence');
  if (!_.isEmpty(newOccurrenceDocs)) {
    await Occurrence.insertMany(newOccurrenceDocs);
  }
  await TaskInfo.updateOne(
    { key: 'generate-occurrences' },
    { $set: { 'taskInfo.pulledUntil': nowDatetime } }
  ).exec();
  if (!_.isEmpty(newOccurrenceDocs)) {
    const updatedUsers = _.uniq(_.map(newOccurrenceDocs, 'userId'));
    console.log('updatedUsers', updatedUsers);
    // TODO: send signal on each user's socket room to re-fetch occurrences
    // TODO: send push notification for each occurrence
  }
};

module.exports = generateOccurrences;
