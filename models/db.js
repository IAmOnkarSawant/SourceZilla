const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const HttpError = require('./http-error');
const appConfig = require('../config/appConfig');

let URL = process.env.NODE_ENV === 'production' ? appConfig.DB_URL_CLOUD : appConfig.DB_URL_LOCAL

mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }, (err) => {
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
  url: URL,
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

function retrieveVideoFile(res,req, next, fileName) {

  gfs.files.findOne({
    filename: fileName
  }, function (err, file) {
    if (err) {
      return res.status(400).send({
        err: 'Some error is there'
      });
    }
    if (!file) {
      return res.status(404).send({
        err: 'No file Found'
      });
    }
    console.log(file)
    if (req.headers['range']) {
      var parts = req.headers['range'].replace(/bytes=/, "").split("-");
      console.log(parts)
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart, 10);
      var end = partialend ? parseInt(partialend, 10) : file.length - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
        'Content-Type': file.contentType
      });

      gfs.createReadStream({
        _id: file._id,
        range: {
          startPos: start,
          endPos: end
        }
      }).pipe(res);
    } else {
      res.header('Content-Length', file.length);
      res.header('Content-Type', file.contentType);

      gfs.createReadStream({
        _id: file._id
      }).pipe(res);
    }
  });

}

require('./userSchema');
require('./postSchema');
require('./categorySchema');
require('./privateGroupSchema');
require('./interviewExperienceSchema')
require('./companySchema')

module.exports = { gfs, upload, deleteFile, getFileDetails, retrieveFile, retrieveVideoFile };