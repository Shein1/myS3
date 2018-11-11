import Sequelize, { Op } from 'sequelize';
import dotenv from 'dotenv';
import User from './user';
import Bucket from './bucket';
import Blob from './blob';

dotenv.config();

export const db = new Sequelize(process.env.DATABASE_URL, {
  operatorsAliases: Op,
  define: {
    underscored: true,
  },
});

/* *
  @ Model init
* */

User.init(db, Sequelize);
Bucket.init(db, Sequelize);
Blob.init(db, Sequelize);

/* *
  @ Foreign Key init
* */

// A User can have few Buckets but an Bucket belongs to one User
User.hasMany(Bucket, { as: 'buckets' });
Bucket.belongsTo(User, { constraints: false, as: 'user' });

// A Bucket can have few blobs but an Blob belongs to one Bucket
Bucket.hasMany(Blob, { as: 'blobs' });
Blob.belongsTo(Bucket, { constraints: false, as: 'bucket' });
