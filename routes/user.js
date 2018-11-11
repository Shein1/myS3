import { Router } from 'express';
import { pick } from 'lodash';
import User from '../models/user';

const api = Router();

/* *
  @ Get information about a specific user
* */

api.get('/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.params.uuid } });
    const { uuid, nickname, email } = user.toJSON();

    if (user) {
      res.status(200).json({ data: { user: { uuid, nickname, email } }, meta: { status: 200 } });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Update informations of a user
* */

api.patch('/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.params.uuid } });
    if (user) {
      const fields = pick(req.body, ['nickname', 'email', 'password', 'password_confirmation']);
      user.update(fields);
      res
        .status(200)
        .json({ data: { user }, meta: { status: 201 } })
        .send();
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Delete a user
* */

api.delete('/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ attributes: ['uuid'], where: { id: req.params.uuid } });
    if (user) {
      try {
        await User.destroy({ where: { id: req.params.id } });
        res
          .status(200)
          .json({ succes: 'Alert has been successfully deleted ', meta: { status: 500 } });
      } catch (e) {
        res.status(500).json({ err: 'Something went wrong', meta: { status: 500 } });
      }
    } else {
      res.status(400).json({ err: "Id don't exist, please try again", meta: { status: 400 } });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

export default api;
