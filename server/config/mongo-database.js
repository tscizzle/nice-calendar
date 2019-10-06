const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connectMongo = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  const MONGO_CONNECTION_STRING =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/nice-calendar';

  // configure mongo options
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    reconnectTries: Number.MAX_VALUE,
  };
  if (isProduction) {
    options.config = { autoIndex: false };
  }

  // connect to the mongo database
  mongoose
    .connect(MONGO_CONNECTION_STRING, options)
    .catch(err => console.log(`Error connecting to mongo: ${err}`));
};

module.exports = connectMongo;
