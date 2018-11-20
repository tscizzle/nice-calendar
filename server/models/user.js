const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { DefaultSchema } = require('./schema-helpers');

const userSchema = DefaultSchema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  settings: {},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);