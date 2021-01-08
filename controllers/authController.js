const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const authenticate = require('../middlewares/authenticate');
const restricted = require('../middlewares/restricted');
const HttpError = require('../models/http-error');
const User = mongoose.model('User');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({ message: 'User Router Setup' });
});

router.post('/signup',
    [check('userName').isLength({ min: 4 }), check('emailId').isEmail(), check('password').isLength({ min: 6 })],

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new HttpError(`${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please enter valid inputs.`
                , 422)
            return next(err);
        }

        const { userName, emailId, password, role } = req.body;

        let existingUser;
        try {
            existingUser = await User.findOne({ emailId });
        } catch (err) {
            const error = new HttpError('Signing up failed,please try again.', 500);
            return next(error);
        }

        if (existingUser) {
            const error = new HttpError('User already exists,please try logging in', 422);
            return next(error);
        }

        let hashedpassword;
        try {
            hashedpassword = await bcrypt.hash(password, 10);
        } catch (err) {
            const error = new HttpError('Could not create user,please try again', 500)
            return next(error);
        }


        const createdUser = new User({
            userName,
            emailId,
            password: hashedpassword,
            role: role
        });

        try {
            await createdUser.save();
        } catch (err) {
            const error = new HttpError(
                'Error while creating new user',
                500
            );
            return next(error);
        }

        // let token;
        // try {
        //     token = jwt.sign(
        //         {userId:createdUser.id,emailId:createdUser.emailId,role:createdUser.role},
        //         process.env.JWT_SECRET_KEY,
        //         {expiresIn:"1h"}
        //     );    
        // } catch (err) {
        //     const error = new HttpError(
        //         'Signup failed,please try again.',
        //         500
        //         );
        //         return next(error);
        // }

        res.status(201).json({ userId: createdUser.id, emailId: createdUser.emailId });
    });

router.post('/login', [check('emailId').isEmail(), check('password').isLength({ min: 6 })], async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(`${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please enter valid inputs.`
            , 422)
        return next(err);
    }

    const { emailId, password } = req.body;

    let existingUser;
    // existing user in database check
    try {
        existingUser = await User.findOne({ emailId });
    } catch (err) {
        const error = new HttpError('Logging in failed,please try again', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials,please try again', 401);
        return next(error);
    }

    // password check
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Could not log you in,please verify your credentials and try again.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials,could not log you in.', 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, emailId: existingUser.emailId, role: existingUser.role, userName: existingUser.userName },
            'something_very_secure_and_private',
            { expiresIn: "432000000000" }
        );
    } catch (err) {
        const error = new HttpError(
            'Logging in failed,please try again.',
            500
        );
        return next(error);
    }

    res.status(200).json({
        userId: existingUser.id, emailId: existingUser.emailId, token: token
    });

});

///////////////////////////////////////////////////////
router.get('/user', authenticate, (req, res) => {
    res.json(req.user)
});

router.get('/getallusers', authenticate, restricted, (req, res) => {
    User.find({}).sort('role')
        .then((data) => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json(err)
        })
})


router.delete('/deleteuser/:id', authenticate, restricted, (req, res) => {
    User.findByIdAndDelete({ _id: req.params.id }, (err, response) => {
        if (err) {
            res.status(400).json({ err: 'Some Error is occurs' })
        }
        res.status(200).json({
            success: true,
            msg: 'User Deleted Successfully'
        })
    })
})


module.exports = router;