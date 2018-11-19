const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';

const MONGO_CONNECTION_STRING =
  process.env.MONGODB_URI || 'mongodb://localhost:27017';

mongoose.Promise = global.Promise;

if (isProduction) {
  mongoose.connect(
    MONGO_CONNECTION_STRING,
    { config: { autoIndex: false } }
  );
} else {
  mongoose.connect(MONGO_CONNECTION_STRING);
}
