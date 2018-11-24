const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DefaultSchema } = require('./schema-helpers');

const REPETITION_TYPES = ['everyXUnits'];
const EVERY_UNIT_TYPES = ['day', 'week', 'month', 'year'];

const eventSchema = DefaultSchema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  datetime: { type: Date, required: true, index: true },
  isRecurring: { type: Boolean, required: true },
  // recurringSchedule is required if isRecurring: true
  recurringSchedule: new Schema({
    repetitionType: { type: String, required: true, enum: REPETITION_TYPES },
    everyX: { type: Number },
    everyUnit: { type: String, required: true, enum: EVERY_UNIT_TYPES },
    _id: false,
  }),
  tags: { type: [String], required: true },
  isDeleted: { type: Boolean, index: true },
});

module.exports = mongoose.model('Event', eventSchema);
