const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Post = mongoose.model('Post');

const authenticate = require('../middlewares/authenticate');
const HttpError = require('../models/http-error');
const { upload, deleteFile, getFileDetails } = require('../models/db');
const { check, validationResult } = require('express-validator');



router.get('/details', authenticate, async (req, res, next) => {

    const userId = req.user.userId;

    let user, userDetails;
    try {
        user = await User.findById(userId).select('-password').exec();
    } catch (err) {
        const error = new HttpError('Could not find user', 500);
        return next(error);
    }

    if (user.profileImage) {
        let file = await getFileDetails(next, user.profileImage);

        userDetails = { 
            "role": user.role,
            "myPosts": user.myPosts,
            "resourceBox": user.resourceBox,
            "categoriesFollowed": user.categoriesFollowed,
            "myPrivateGroups": user.myPrivateGroups,
            "socialHandles": user.socialHandles,
            "_id": user._id,
            "userName": user.userName,
            "emailId": user.emailId,
            "file_id": file._id,
            "fileName": file.filename
        }
    }
    else {
        userDetails = {
            "role": user.role,
            "myPosts": user.myPosts,
            "resourceBox": user.resourceBox,
            "categoriesFollowed": user.categoriesFollowed,
            "myPrivateGroups": user.myPrivateGroups,
            "socialHandles": user.socialHandles,
            "_id": user._id,
            "userName": user.userName,
            "emailId": user.emailId,
        }
    }

    res.json({ user: userDetails });

});

router.get('/myposts', authenticate, async (req, res, next) => {
    const userId = req.user.userId;

    let user, updatedPosts, userPost;
    try {
        user = await User.findById(userId).populate('myPosts').exec();
    } catch (err) {
        const error = new HttpError('Could Not find your posts', 500);
        return next(error);
    }

    let file = {};
    updatedPosts = await Promise.all(user.myPosts.map(async (post) => {
        try {
            userPost = await Post.findById(post._id).exec();
        } catch (err) {
            const error = new HttpError('Unable to perform your operation', 500);
            return next(error);
        }
        if (userPost.uploads) {
            file = await getFileDetails(next, userPost.uploads);
            return {
                accessibilty: post.accessibilty,
                upvotes: post.upvotes,
                downvotes: post.downvotes,
                reports: post.reports,
                spamFlag: post.spamFlag,
                _id: post._id,
                postContent: post.postContent,
                postBy: post.postBy,
                createdAt: post.createdAt,
                comments: post.comments,
                fileName: file.filename,
                file_id: file._id
            }
        } else {
            return {
                accessibilty: post.accessibilty,
                upvotes: post.upvotes,
                downvotes: post.downvotes,
                reports: post.reports,
                spamFlag: post.spamFlag,
                _id: post._id,
                postContent: post.postContent,
                postBy: post.postBy,
                createdAt: post.createdAt,
                comments: post.comments,
            }
        }

    }))

    res.status(200).json({ posts: updatedPosts });

});

router.get('/resourcebox', authenticate, async (req, res, next) => {
    const userId = req.user.userId;

    let user, updatedPosts, userPost;
    try {
        user = await User.findById(userId).populate('resourceBox').exec();
    } catch (err) {
        const error = new HttpError('Could Not find your resource box posts', 500);
        return next(error);
    }

    let file = {};
    updatedPosts = await Promise.all(user.resourceBox.map(async (post) => {
        try {
            userPost = await Post.findById(post._id).exec();
        } catch (err) {
            const error = new HttpError('Unable to perform your operation', 500);
            return next(error);
        }
        if (userPost.uploads) {
            file = await getFileDetails(next, userPost.uploads);
            return {
                accessibilty: post.accessibilty,
                upvotes: post.upvotes,
                downvotes: post.downvotes,
                reports: post.reports,
                spamFlag: post.spamFlag,
                _id: post._id,
                postContent: post.postContent,
                postBy: post.postBy,
                createdAt: post.createdAt,
                comments: post.comments,
                fileName: file.filename,
                file_id: file._id
            }
        } else {
            return {
                accessibilty: post.accessibilty,
                upvotes: post.upvotes,
                downvotes: post.downvotes,
                reports: post.reports,
                spamFlag: post.spamFlag,
                _id: post._id,
                postContent: post.postContent,
                postBy: post.postBy,
                createdAt: post.createdAt,
                comments: post.comments,
            }
        }
    }))

    res.status(200).json({ resourcebox: updatedPosts });
});


router.delete('/resourcebox/:postId', authenticate, async (req, res, next) => {

    const { postId } = req.params;
    const userId = req.user.userId;

    console.log(postId)

    try {
        await User.findByIdAndUpdate(userId, { $pull: { resourceBox: postId } });
    } catch (err) {
        const error = new HttpError('Could Not Perform deletion from resource box', 500);
        return next(error);
    }

    res.status(200).json({ "message": "All deletions successful" });
});



router.patch('/changedp', upload.single('file'), authenticate, async (req, res, next) => {
    if (!req.file) {
        const error = new HttpError('No File Found', 400);
        return next(error);
    }

    if (!(req.file.contentType === 'image/jpeg' || req.file.contentType === 'image/png' || req.file.contentType === 'image/jpg' || req.file.contentType === 'image/webp')) {
        deleteFile(next, req.file.id);
        const error = new HttpError('Please upload an Image', 400);
        return next(error);
    }

    const newDp = req.file.id;
    const userId = req.user.userId;

    let user;
    try {
        user = await User.findByIdAndUpdate(userId, { profileImage: newDp }, { new: true });
    } catch (err) {
        const error = new HttpError('Could not update your display picture', 500);
        return next(error);
    }
    let file = await getFileDetails(next, user.profileImage)

    res.status(200).json({ "message": "Successfully Updated display picture", "fileName": file.filename, "file_id": file._id });
});


router.patch('/changeusername', [check('newUserName').isLength({ min: 4 })], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(`${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please enter valid inputs.`
            , 422)
        return next(err);
    }

    const { newUserName } = req.body;
    const userId = req.user.userId;

    try {
        await User.findByIdAndUpdate(userId, { userName: newUserName });
    } catch (err) {
        const error = new HttpError('Could not change your username', 500);
        return next(error);
    }

    res.status(200).json({ "message": "Successfully Updated username" });

});

// LINKS UPDATE ROUTED
router.patch('/addgithub', [check('github').isURL({ host_whitelist: [/^.*github\.com$/,] })], authenticate, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(`${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please enter valid inputs.`
            , 422)
        return next(err);
    }
    const { github } = req.body;
    const userId = req.user.userId;

    try {
        await User.findByIdAndUpdate(userId, { 'socialHandles.github': github })
    } catch (err) {
        const error = new HttpError('Could Not Update your Github Social Handle', 500);
        return next(error);
    }

    res.status(200).json({ "message": "Successfully updated Github Social Handle" });
})

router.patch('/addlinkedIn', [check('linkedIn').isURL({ host_whitelist: [/^.*linkedin\.com$/,] })], authenticate, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(`${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please enter valid inputs.`
            , 422)
        return next(err);
    }
    const { linkedIn } = req.body;
    const userId = req.user.userId;

    try {
        await User.findByIdAndUpdate(userId, { 'socialHandles.linkedIn': linkedIn })
    } catch (err) {
        const error = new HttpError('Could Not Update your LinkedIn Social Handle', 500);
        return next(error);
    }

    res.status(200).json({ "message": "Successfully updated LinkedIn Social Handle" });

})

router.patch('/addtwitter', [check('twitter').isURL({ host_whitelist: [/^.*twitter\.com$/,] })], authenticate, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(`${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please enter valid inputs.`
            , 422)
        return next(err);
    }
    const { twitter } = req.body;
    const userId = req.user.userId;

    try {
        await User.findByIdAndUpdate(userId, { 'socialHandles.twitter': twitter })
    } catch (err) {
        const error = new HttpError('Could Not Update your Twitter Social Handle', 500);
        return next(error);
    }

    res.status(200).json({ "message": "Successfully updated Twitter Social Handle" });
})

module.exports = router;