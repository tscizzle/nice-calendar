const mongoose = require('mongoose');

const { DefaultSchema } = require('./schema-helpers');

const occurrenceSchema = DefaultSchema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  datetime: { type: Date, required: true },
  checkedOff: { type: Boolean, required: true },
  isDeleted: Boolean,
});

module.exports = mongoose.model('Occurrence', occurrenceSchema);
