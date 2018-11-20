const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefaultSchema = (obj, options = {}, ...otherArgs) => {
  // ensures _id is a string
  obj._id = { type: String, required: true };

  // puts createdAt and updatedAt into the schema
  options.timestamps = true;

  const schema = Schema(obj, options, ...otherArgs);

  // hook for updating createdAt and updatedAt on creation and every update
  schema.pre('save', function(next) {
    if (this.isNew) {
      this.set('createdAt', Date.now());
    }
    this.set('updatedAt', Date.now());
    next();
  });

  return schema;
};

module.exports = {
  DefaultSchema: DefaultSchema,
};
