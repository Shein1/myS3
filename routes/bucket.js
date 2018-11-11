import express from 'express';
import Bucket from '../models/bucket';
import Blob from '../models/blob';
import FileSystem from '../lib/filesystem';

const api = express.Router({ mergeParams: true });

/* *
  @ Create a new bucket
* */

api.post('/', async (req, res) => {
  try {
    console.log(req.params);
    const { uuid } = req.params;
    const { name } = req.body;
    const bucket = new Bucket({ name, user_uuid: uuid });

    await bucket.save();
    FileSystem.createBucket(uuid, name);
    res
      .status(201)
      .json({ success: 'Bucket has been successfully created', meta: { status: 201 } });
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Delete a bucket
* */

api.delete('/:id', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { id } = req.params;

    const bucket = await Bucket.findOne({
      attributes: ['id'],
      where: { user_uuid: uuid, id },
    });

    if (bucket) {
      try {
        FileSystem.removeBlob();
        await Bucket.destroy({ where: { id: bucket.id } });
        res
          .status(204)
          .json({ success: 'Bucket has been successfully deleted ', meta: { status: 204 } });
      } catch (e) {
        res.status(400).json({ err: "Id don't exist, please try again", meta: { status: 400 } });
      }
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Check the existence of a bucket
* */

api.head('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bucket = await Bucket.findOne({
      where: { id },
    });

    if (bucket) {
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Get informations of a Bucket
* */

api.get('/:id', async (req, res) => {
  try {
    const { uuid } = req.params;
    const bucket = await Bucket.findOne({ where: { user_uuid: uuid } });
    const { id } = bucket.toJSON();

    if (bucket) {
      try {
        const bucket_content = await Blob.findAll({
          attributes: ['name'],
          where: { bucket_id: id },
        });

        if (bucket_content.length !== 0) {
          res.status(200).json({
            data: `Your bucket ${bucket.name} had ${bucket_content.length} items`,
            meta: { status: 200 },
          });
        } else {
          res
            .status(404)
            .json({ error: `Your bucket with id ${id} is empty`, meta: { status: 404 } });
        }
      } catch (e) {
        res.status(400).json({ error: e.message, meta: { status: 400 } });
      }
    } else {
      res
        .status(404)
        .json({ error: `Your bucket with id ${id} don't exist`, meta: { status: 404 } });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

export default api;
