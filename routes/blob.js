import express from 'express';
import multer from 'multer';
import Blob from '../models/blob';
import FileSystem from '../lib/filesystem';
import Bucket from '../models/bucket';

/* *
  @ Settings of storage with Multer
* */

const storage = multer.diskStorage({
  destination: '/tmp/',
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const api = express.Router({ mergeParams: true });

/* *
  @ Get all blob in the bucket
* */

api.get('/', async (req, res) => {
  try {
    const blob = await Blob.findAll();
    if (blob.length === 0) {
      res.status(204).json({ error: "There's no blob on your Bucket", meta: { status: 204 } });
    } else {
      res.status(200).json({ data: blob.count, meta: { status: 200 } });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Create a new blob in the bucket
* */

api.post('/', upload.any(), async (req, res) => {
  try {
    if (req.files !== undefined) {
      const { uuid, id } = req.params;
      const { originalname, size } = req.files[0];

      try {
        const bucket = await Bucket.findOne({ attributes: ['name'], where: { id } });
        const { name } = bucket.dataValues;
        FileSystem.createBlob(uuid, name, originalname);
      } catch (e) {
        res
          .status(400)
          .json({ error: 'Something went wrong, please try again', meta: { status: 400 } });
      }

      const blob = new Blob({
        name: originalname,
        path: `/opt/workspace/mys3/${uuid}/${id}/${originalname}`,
        size,
        bucket_id: id,
      });

      await blob.save();

      res
        .status(201)
        .json({ data: `Blob ${blob.name} has been successfully created`, meta: { status: 201 } });
    } else {
      res
        .status(400)
        .json({ error: 'There is no files to upload, please try again', meta: { status: 400 } });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Delete blob in the bucket
* */

api.delete('/:blob_id', async (req, res) => {
  try {
    const { id, blob_id, uuid } = req.params;

    const blob = await Blob.findOne({
      attributes: ['id', 'name'],
      where: { id: blob_id, bucket_id: id },
    });

    if (blob) {
      try {
        await Blob.destroy({ where: { id: blob.id, user_uuid: uuid } });
        res.status(204).json({
          data: `Blob ${blob.name} has been successfully deleted`,
          meta: { status: 204 },
        });
      } catch (e) {
        res
          .status(400)
          .json({ err: `Blob ${blob.name} don't exist, please try again`, meta: { status: 400 } });
      }
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Get information about a specific blob in the bucket
* */

api.get('/:blob_id', async (req, res) => {
  try {
    const { id, blob_id } = req.params;

    const blob = await Blob.findOne({
      attributes: ['name', 'id', 'bucket_id'],
      where: { id: blob_id, bucket_id: id },
    });
    if (blob) {
      res.status(200).json({ data: blob, meta: { status: 200 } });
    } else {
      res.status(400).json({
        error: `There's no blob with id : ${blob_id} on your Bucket`,
        meta: { status: 400 },
      });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

/* *
  @ Get meta information about a specific blob in the bucket
* */

api.get('/:blob_id/meta', async (req, res) => {
  try {
    const { id, blob_id } = req.params;

    const blob = await Blob.findOne({
      attributes: ['path', 'size'],
      where: { id: blob_id, bucket_id: id },
    });
    if (blob) {
      res.status(200).json({ meta: { path: blob.path, size: `${blob.size} ko`, status: 200 } });
    } else {
      res
        .status(400)
        .json({ error: `There's no blob ${blob.name} on your Bucket`, meta: { status: 400 } });
    }
  } catch (e) {
    res.status(400).json({ error: e.message, meta: { status: 400 } });
  }
});

export default api;
