import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Mail from '../lib/mail';
import FileSystem from '../lib/filesystem';

const api = express.Router();

/* *
  @ Register a user
* */

api.post('/register', async (req, res) => {
  const {
    nickname, email, password, password_confirmation,
  } = req.body;

  try {
    const user = new User({
      nickname,
      email,
      password,
      password_confirmation,
    });

    await user.save();

    const text = 'New Subscription';
    const html = `<p>Bonjour ${user.nickname}</p>`;

    const payload = {
      uuid: user.uuid,
      nickname,
      email,
    };
    const token = jwt.sign({ payload }, process.env.JWT_ENCRYPTION);

    Mail.send(user.email, text, 'Welcome', html);
    FileSystem.addUserWorkspace(user.uuid);

    res.status(201).json({ data: { user }, meta: { status: 201, token } });
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Login of user
* */

api.post('/login', (req, res) => {
  try {
    passport.authenticate('local', { session: false }, (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message, meta: { status: 400 } });
      }

      const { uuid, nickname, email } = user.toJSON();

      const token = jwt.sign({ uuid, nickname, email }, process.env.JWT_ENCRYPTION);

      res.status(201).json({ data: { uuid, nickname, email }, meta: { token, status: 201 } });
    })(req, res);
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

export default api;
