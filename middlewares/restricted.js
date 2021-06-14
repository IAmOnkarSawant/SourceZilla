const HttpError = require('../models/http-error');

const restrictedAccess = (req,res,next) =>{
    if(req.user.role === 'User'){
        const error = new HttpError('You are unauthorized to perform this operation',403);
        return next(error);
    }
    next();
}

module.exports = restrictedAccess;