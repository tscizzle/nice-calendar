const routes = (app, passport) => {
  require('./auth')({ app, passport });
  require('./user')({ app });
  require('./event')({ app });
  require('./occurrence')({ app });
};

module.exports = routes;
