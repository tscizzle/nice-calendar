const _ = require('lodash');

const Event = require('../models/event');
const {
  checkLoggedIn,
  checkRequestedUser,
  checkRequiredFields,
} = require('../middleware');

const eventRoutes = ({ app }) => {
  // --- get the events for a user
  app.get(
    '/get-events/:userId',
    checkLoggedIn(),
    checkRequestedUser(['params', 'userId']),
    checkRequiredFields({ paramFields: ['userId'] })
  );
  app.get('/get-events/:userId', (req, res) => {
    const { userId } = req.params;

    Event.find({ userId }, (err, events) => {
      const eventMap = _.keyBy(events, '_id');
      return err
        ? res.status(500).json({ err })
        : res.json({ events: eventMap });
    });
  });

  // --- upsert an event
  app.post(
    '/upsert-event',
    checkLoggedIn(),
    checkRequestedUser(),
    checkRequiredFields({ bodyFields: ['eventId', 'userId', 'updatedFields'] })
  );
  app.post('/upsert-event', (req, res) => {
    const { eventId, userId, updatedFields } = req.body;

    Event.findOne({ _id: eventId, userId }, (err, existingEvent) => {
      if (err) return res.status(500).json({ err });

      let eventDoc;
      if (existingEvent) {
        eventDoc = existingEvent;
        _.each(updatedFields, (value, key) => (eventDoc[key] = value));
      } else {
        eventDoc = new Event({ ...updatedFields, _id: eventId, userId });
      }

      eventDoc.save((err, savedEvent) => {
        return err
          ? res.status(422).json({ err })
          : res.json({ success: true });
      });
    });
  });

  // --- delete an event
  app.post(
    '/delete-event',
    checkLoggedIn(),
    checkRequestedUser(),
    checkRequiredFields({ bodyFields: ['eventId', 'userId'] })
  );
  app.post('/delete-event', (req, res) => {
    const { eventId, userId } = req.body;

    Event.findOne({ _id: eventId, userId }, (err, existingEvent) => {
      if (err) return res.status(500).json({ err });

      if (!existingEvent) {
        return res.status(422).json({ err: 'Cannot find event.' });
      }

      existingEvent.isDeleted = true;
      existingEvent.save((err, savedEvent) => {
        return err
          ? res.status(422).json({ err })
          : res.json({ success: true });
      });
    });
  });
};

module.exports = eventRoutes;
