const routes = ({ app, passport, io }) => {
  require('./auth')({ app, passport });
  require('./user')({ app });
  require('./event')({ app });
  require('./occurrence')({ app });
  require('./socket')({ io });
};

module.exports = routes;
