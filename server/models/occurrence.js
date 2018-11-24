const mongoose = require('mongoose');

const { DefaultSchema } = require('./schema-helpers');

const occurrenceSchema = DefaultSchema({
  userId: { type: String, required: true, index: true },
  eventId: { type: String, required: true, index: true },
  datetime: { type: Date, required: true, index: true },
  checkedOff: { type: Boolean, required: true },
  isDeleted: { type: Boolean, index: true },
});

module.exports = mongoose.model('Occurrence', occurrenceSchema);
