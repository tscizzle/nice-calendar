const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { DefaultSchema } = require('./schema-helpers');

const userSchema = DefaultSchema({
  email: { type: String, required: true, unique: true },
  latestDevice: {
    id: String,
    platform: { type: String, allowedValues: ['android', 'ios'] },
  },
  settings: {},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
