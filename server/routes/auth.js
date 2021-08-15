const crypto = require('crypto');
const sendgridAPI = require('../config/sendgrid-api');
const User = require('../models/user');

const { checkRequiredFields } = require('./middleware');
const { randomID } = require('../../src/common/misc-helpers');

const auth = ({ app, passport }) => {
  // --- register a user
  app.post(
    '/register',
    checkRequiredFields({ bodyFields: ['username', 'email', 'password'] })
  );
  app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const _id = randomID();
    User.register(new User({ _id, username, email }), password, (err, user) => {
      if (err) return res.status(500).json({ err });

      passport.authenticate('local')(req, res, () => {
        return res.json({ message: 'Registration succeeded.' });
      });
    });
  });

  // --- login a user
  app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({ err: info });
      }

      req.login(user, () => {
        return res.json({ message: 'Login succeeded.' });
      });
    })(req, res, next);
  });

  // --- logout a user
  app.get('/logout', (req, res) => {
    req.logout();
    return res.json({ message: 'Logout succeeded.' });
  });

  // --- get the logged in user
  app.get('/loggedInUser', (req, res) => {
    return req.user
      ? res.json({ user: req.user })
      : res.json({ message: 'No user is logged in.' });
  });

  // --- send the user an email with a link to reset their password
  app.post(
    '/initiateResetPassword',
    checkRequiredFields({ bodyFields: ['email', 'origin'] })
  );
  app.post('/initiateResetPassword', function(req, res) {
    const { email, origin } = req.body;

    User.findOne({ email }, (err, user) => {
      if (err) return res.status(500).send({ err });

      if (!user) {
        return res.status(422).json({ err: 'No user found with that email.' });
      }

      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');

        User.updateOne(
          { email },
          {
            $set: {
              resetPasswordToken: token,
              resetPasswordExpires: Date.now() + 3600 * 1000, // token expires in an hour
            },
          },
          (err, numAffected) => {
            if (err) return res.status(500).send({ err });

            const confirmation_link = `${origin}/app/resetPassword?token=${token}`;

            const toEmail = user.email;
            const subject = 'NiceCalendar Password Reset';
            const fromEmail = 'tscizzle@gmail.com';
            const fromName = 'Bob at NiceCalendar';
            const email_type = 'text/html';
            const email_body =
              `<p>You may follow this link ` +
              `(<b><a href="${confirmation_link}">${confirmation_link}</a></b>) ` +
              `to reset your password. The link will be valid for 1 hour.</p>` +
              `<i style="font-size: 0.9em;">If this was not you, you may ignore this email</i>`;

            const request = sendgridAPI.emptyRequest({
              method: 'POST',
              path: '/v3/mail/send',
              body: {
                personalizations: [
                  { to: [{ email: toEmail }], subject: subject },
                ],
                from: { email: fromEmail, name: fromName },
                content: [{ type: email_type, value: email_body }],
              },
            });

            sendgridAPI.API(request, err => {
              if (err) return res.status(500).json({ err });

              return res.json({ success: true });
            });
          }
        );
      });
    });
  });

  // --- reset a user's password
  app.post(
    '/resetPassword/:token',
    checkRequiredFields({
      paramsFields: ['token'],
      bodyFields: ['newPassword'],
    })
  );
  app.post('/resetPassword/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    User.findOne(
      { resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } },
      (err, user) => {
        if (err) return res.status(500).send({ err });

        if (!user) {
          return res.status(422).json({
            err: 'Reset token is either invalid or expired.',
          });
        }

        user.setPassword(newPassword, err => {
          if (err) return res.status(500).send({ err });

          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(err => {
            if (err) return res.status(500).send({ err });

            return res.json({ success: true });
          });
        });
      }
    );
  });
};

module.exports = auth;
