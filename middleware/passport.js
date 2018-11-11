import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import dotenv from 'dotenv';
import User from '../models/user';

dotenv.config();

/* *
  @ Initialize LocalStrategy process
* */

passport.use(
  new LocalStrategy(
    {
      usernameField: 'nickname',
      passwordField: 'password',
    },
    async (nickname, password, done) => {
      try {
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
          return done(`Can't find user ${nickname}`);
        }

        if (!(await user.checkPassword(password))) {
          return done('Please check your password');
        }

        return done(false, user);
      } catch (err) {
        return done('Something wrong happens');
      }
    },
  ),
);

/* *
  @ Initialize JWTStrategy process
* */

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ENCRYPTION,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findOne({ where: { uuid: jwtPayload.payload.uuid } });

        if (!user) {
          return done(`User ${user.uuid} doesn't exist`);
        }
        done(false, user);
        return user;
      } catch (e) {
        return done(e.message);
      }
    },
  ),
);
