const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        const error = new HttpError('Authentication failed,as no token was found');
        return next(error);
    }
    jwt.verify(token, 'something_very_secure_and_private', (err, user) => {
        if (err) {
            const error = new HttpError('Authentication failed!', 401);
            return next(error);
        } else {
            req.user = user;
            next();
        }
    })
}

module.exports = authenticate;
