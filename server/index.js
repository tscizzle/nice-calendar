require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const isProduction = process.env.NODE_ENV === 'production';

// mongo database
require('./config/mongo-database');

// initialize server
const app = express();
const server = require('http').Server(app);

// other config
app.use(morgan('dev'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cookieParser());
const redisClient = require('./config/redis-client');
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    maxAge: new Date(253402300000000), // don't expire any time soon
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
  })
);
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
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);
    next();
  };
  app.use(allowCORS);
}

// routes
require('./routes/routes')(app, passport);

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

// error handling
const rollbar = require('./config/rollbar-api');
app.use(rollbar.errorHandler());

// start server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
