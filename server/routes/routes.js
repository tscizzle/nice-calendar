const routes = (app, passport) => {
  require('./auth')(app, passport);
  require('./user')(app);
};

module.exports = routes;
