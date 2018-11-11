import express from 'express';
import passport from 'passport';

import user from './user';
import auth from './auth';
import bucket from './bucket';
import blob from './blob';

const api = express.Router();

/* *
  @ First route of the API
* */

api.get('/', (req, res) => {
  res.json({
    hi: 'Welcome my S3 API',
    meta: {
      status: 200,
    },
  });
});

/* *
  @ Use of all routes of myS3
* */

api.use('/users', passport.authenticate('jwt', { session: false }), user);
api.use('/users/:uuid/buckets', passport.authenticate('jwt', { session: false }), bucket);
api.use('/users/:uuid/buckets/:id/blobs', passport.authenticate('jwt', { session: false }), blob);

api.use('/auth', auth);

export default api;
