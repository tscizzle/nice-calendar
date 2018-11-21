const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DefaultSchema } = require('./schema-helpers');

const TASK_TYPES = ['generate-occurrences'];

const taskInfoSchema = DefaultSchema({
  key: {
    type: String,
    required: true,
    unique: true,
    allowedValues: TASK_TYPES,
  },
  taskInfo: { type: Schema.Types.Mixed, required: true }, // structure depends on the key
});

module.exports = mongoose.model('TaskInfo', taskInfoSchema);
