import fs from 'fs';
import path from 'path';

class FileSystem {
  constructor() {
    if (!FileSystem.instance) {
      FileSystem.instance = this;
      this.initialize();
    }
    return FileSystem.instance;
  }

  initialize() {
    this.ROOT_DIRECTORY = '/opt/workspace/mys3/';
  }

  addUserWorkspace(user) {
    const dir = path.join(this.ROOT_DIRECTORY, user);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  createBucket(user, bucketName) {
    try {
      const dir = path.join(this.ROOT_DIRECTORY, user, bucketName);
      console.log(dir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        return true;
      }
      return false;
    } catch (er) {
      return er.message;
    }
  }

  removeBucket(user, bucketName) {
    try {
      const dir = path.join(this.ROOT_DIRECTORY, user, bucketName);
      if (!fs.existsSync(dir)) {
        fs.rmdir(dir);
        return true;
      }
      return false;
    } catch (er) {
      return er.message;
    }
  }

  createBlob(user, bucketName, blobName) {
    try {
      const dir = path.join(this.ROOT_DIRECTORY, user, bucketName);

      fs.renameSync(`/tmp/${blobName}`, `${dir}/${blobName}`, (err) => {
        if (err) throw err;
        console.log('Rename complete!');
      });
      return false;
    } catch (er) {
      return er.message;
    }
  }
}

const instance = new FileSystem();
Object.freeze(instance);
export default instance;
