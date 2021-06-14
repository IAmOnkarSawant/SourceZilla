const express = require('express');
const router = express.Router();
const HttpError = require('../models/http-error');
const authenticate = require('../middlewares/authenticate');
const { retrieveVideoFile } = require('../models/db');

router.get('/live/:fileName', (req, res, next) => {
    const fileName = req.params.fileName;
    console.log(fileName)
    retrieveVideoFile(res, req, next, fileName)
})

module.exports = router;