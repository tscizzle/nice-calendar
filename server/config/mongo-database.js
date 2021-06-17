const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const connectMongo = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const MONGO_CONNECTION_STRING =
    process.env.ATLAS_MONGODB_URI || "mongodb://localhost:27017/nice-calendar";

  // Configure mongo options.
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    serverSelectionTimeoutMS: 5000,
  };
  if (isProduction) {
    options.config = { autoIndex: false };
  }

  // Connect to the mongo database.
  mongoose
    .connect(MONGO_CONNECTION_STRING, options)
    .catch((err) => console.log(`Error connecting to mongo: ${err}`));

  // Print to console when connected, reconnected, or disconnected.
  mongoose.connection.on("connected", () => {
    console.info("Mongo connected.");
  });
  mongoose.connection.on("reconnected", () => {
    console.info("Mongo reconnected.");
  });
  mongoose.connection.on("disconnected", () => {
    console.info("Mongo disconnected.");
  });
};

module.exports = connectMongo;
