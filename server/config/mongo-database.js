const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';

const MONGO_CONNECTION_STRING =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/nice-calendar';

mongoose.Promise = global.Promise;

if (isProduction) {
  mongoose.connect(
    MONGO_CONNECTION_STRING,
    {
      config: { autoIndex: false },
      useNewUrlParser: true,
      useCreateIndex: true,
    }
  );
} else {
  mongoose.connect(
    MONGO_CONNECTION_STRING,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
    }
  );
}
