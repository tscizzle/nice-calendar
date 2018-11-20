const _ = require('lodash');

const Occurrence = require('../models/occurrence');
const {
  checkLoggedIn,
  checkRequestedUser,
  checkRequiredFields,
} = require('../middleware');

const occurrenceRoutes = ({ app }) => {
  // --- get the occurrences for a user
  app.get(
    '/get-occurrences/:userId',
    checkLoggedIn(),
    checkRequestedUser(['params', 'userId']),
    checkRequiredFields({ paramFields: ['userId'] })
  );
  app.get('/get-occurrences/:userId', (req, res) => {
    const { userId } = req.params;

    Occurrence.find({ userId }, (err, occurrences) => {
      const occurrenceMap = _.keyBy(occurrences, '_id');
      return err
        ? res.status(500).json({ err })
        : res.json({ occurrences: occurrenceMap });
    });
  });

  // --- upsert an occurrence
  app.post(
    '/upsert-occurrence',
    checkLoggedIn(),
    checkRequestedUser(),
    checkRequiredFields({
      bodyFields: ['occurrenceId', 'userId', 'updatedFields'],
    })
  );
  app.post('/upsert-occurrence', (req, res) => {
    const { occurrenceId, userId, updatedFields } = req.body;

    Occurrence.findOne(
      { _id: occurrenceId, userId },
      (err, existingOccurrence) => {
        if (err) return res.status(500).json({ err });

        let occurrenceDoc;
        if (existingOccurrence) {
          occurrenceDoc = existingOccurrence;
          _.each(updatedFields, (value, key) => (occurrenceDoc[key] = value));
        } else {
          occurrenceDoc = new Occurrence({
            ...updatedFields,
            _id: occurrenceId,
            userId,
          });
        }

        occurrenceDoc.save((err, savedOccurrence) => {
          return err
            ? res.status(422).json({ err })
            : res.json({ success: true });
        });
      }
    );
  });

  // --- delete an occurrence
  app.post(
    '/delete-occurrence',
    checkLoggedIn(),
    checkRequestedUser(),
    checkRequiredFields({ bodyFields: ['occurrenceId', 'userId'] })
  );
  app.post('/delete-occurrence', (req, res) => {
    const { occurrenceId, userId } = req.body;

    Occurrence.findOne(
      { _id: occurrenceId, userId },
      (err, existingOccurrence) => {
        if (err) return res.status(500).json({ err });

        if (!existingOccurrence) {
          return res.status(422).json({ err: 'Cannot find occurrence.' });
        }

        existingOccurrence.isDeleted = true;
        existingOccurrence.save((err, savedOccurrence) => {
          return err
            ? res.status(422).json({ err })
            : res.json({ success: true });
        });
      }
    );
  });
};

module.exports = occurrenceRoutes;
