const User = require('../models/user');
const {
  checkLoggedIn,
  checkRequestedUser,
  checkRequiredFields,
} = require('./middleware');

const userRoutes = ({ app }) => {
  // --- update a setting for a user
  app.post(
    '/user/settings',
    checkLoggedIn(),
    checkRequestedUser(['body', 'user']),
    checkRequiredFields({ bodyFields: ['user'] })
  );
  app.post('/user/settings', (req, res) => {
    const { user, settingName, settingValue } = req.body;

    User.findOne(
      {
        _id: user,
      },
      (err, existingUser) => {
        if (err) return res.status(500).json({ err });

        existingUser.settings[settingName] = settingValue;
        existingUser.save((err, newUser) => {
          return err
            ? res.status(500).send({ err })
            : res.json({ success: true });
        });
      }
    );
  });
};

module.exports = userRoutes;
