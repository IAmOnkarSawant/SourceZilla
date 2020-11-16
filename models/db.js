const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const HttpError = require('./http-error');

mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/DBMS', { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true }, (err) => {
  if (!err) {
    console.log('Connection to Database has been established.');
  }
  else {
    console.log('Error in connecting to Database.' + err);
  }
});

const conn = mongoose.connection;

let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads')
});

// Create Storage Engine
const storage = new GridFsStorage({
  url: process.env.DB_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'// name of the collection should be same as given in gfs.collection()
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

async function deleteFile(next, uploadId) {
  try {
    await gfs.remove({ _id: uploadId, root: 'uploads' })
  } catch (err) {
    const error = new HttpError('Could not delete uploaded files', 500);
    return next(error);
  }
}

async function getFileDetails(next, uploadId) {

  let objFile = {};
  let result = await gfs.files.findOne({ _id: uploadId })
  if (result.err) {
    console.log(err);
  } else {
    objFile = result;
  }
  return objFile;
}

function retrieveFile(res, next, filename) {

  gfs.files.findOne({ filename: filename }, ((err, file) => {
    if (!file || file.length === 0) {
      const error = new HttpError('File not found', 500);
      return next(error);
    }
    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  })
  );

}

require('./userSchema');
require('./postSchema');
require('./categorySchema');
require('./privateGroupSchema');

module.exports = { gfs, upload, deleteFile, getFileDetails, retrieveFile };