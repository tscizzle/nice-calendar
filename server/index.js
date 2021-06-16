require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const passportSocketIo = require('passport.socketio');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const _ = require("lodash");

const isProduction = process.env.NODE_ENV === 'production';

// mongo database
const connectMongo = require('./config/mongo-database');
connectMongo();

// initialize server
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

// other config
app.use(morgan('dev'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cookieParser());
const redisClient = require('./config/redis-client');
const redisStore = new RedisStore({ client: redisClient });
const sessionMiddleware = expressSession({
  secret: process.env.SESSION_SECRET,
  maxAge: new Date(253402300000000), // don't expire any time soon
  store: redisStore,
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);
const socketSessionMiddleware = passportSocketIo.authorize({
  secret: process.env.SESSION_SECRET,
  store: redisStore,
});
io.use(socketSessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// passport config
const User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// allow CORS in development
if (!isProduction) {
  const allowCORS = (req, res, next) => {
    // NOTE: possible there is a need for another line here when using ionic
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:8100'];
    const requestOrigin = req.headers.origin;
    if (_.includes(allowedOrigins, requestOrigin)) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
    }
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);
    next();
  };
  app.use(allowCORS);
}

// routes
const registerRoutes = require('./routes/routes');
registerRoutes({ app, passport, io });

// force https on production
if (isProduction) {
  const forceSSL = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      const secureURL = `https://${req.get('Host')}${req.url}`;
      return res.redirect(secureURL);
    } else {
      return next();
    }
  };
  app.use(forceSSL);
}

// serve assets on production
if (isProduction) {
  // serve static assets
  app.use(express.static(path.resolve(__dirname, '..', 'build')));

  // serve the main file
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

// error handling (TODO: NOT SET UP IN PRODUCTION YET)
const rollbar = require('./config/rollbar-api');
app.use(rollbar.errorHandler());

// kick off jobs
const kickOffTasks = require('./tasks/tasks');
kickOffTasks({ io });

// start server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.info(`App listening on port ${PORT}!`);
});
