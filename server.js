import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import passport from 'passport';
import mLog from './lib/utils';

import { db as database } from './models';
import routes from './routes';
import './middleware/passport';

dotenv.config();

const port = parseInt(process.argv[2], 10) || process.env.PORT;
const app = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extend: false }));

(async () => {
  app.use('/s3_api', routes);
  try {
    await database.authenticate();
    if (process.env.APP === 'dev') {
      // database.sync({ force: process.env.DATABASE_SYNC_FORCE });
      database.sync({ force: false });
    }
    app.listen(port, (err) => {
      if (err) {
        throw err;
      } else {
        mLog(`Server is running on port ${port}`, 'cyan');
      }
    });
  } catch (e) {
    throw e;
  }
})();
