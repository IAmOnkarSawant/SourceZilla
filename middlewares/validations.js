const { check } = require('express-validator');

exports.validateInterviewExperience = [
    check('contentUserInfo.role').isLength({ min: 1 }).withMessage("") ,
    check('contentPrep.passoutYear').isNumeric(),
];
