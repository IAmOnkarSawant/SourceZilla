const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Categories = mongoose.model('Categories');
const PrivateGroups = mongoose.model('PrivateGroup');

const { check, validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const authenticate = require('../middlewares/authenticate');
const { upload, deleteFile, retrieveFile, getFileDetails } = require('../models/db');


/////////////////////////////////////////////////////////////////////////
router.get('/getpost/:postId', async (req, res, next) => {

    let user, post;
    try {
        post = await Post.findById(req.params.postId);
    } catch (err) {
        const error = new HttpError('Unable to perform this operation', 500);
        return next(error);
    }
    try {
        user = await User.findById(post.postBy);
    } catch (err) {
        const error = new HttpError('Unable to perform this operation', 500);
        return next(error);
    }


    let postDetails;
    if (post.accessibilty === 'private') {
        postDetails = {
            "accessibilty": post.accessibilty,
            "upvotes": post.upvotes,
            "downvotes": post.downvotes,
            "reports": post.reports,
            "spamFlag": post.spamFlag,
            "_id": post._id,
            "postContent": post.postContent,
            "postBy": post.postBy,
            "postByUserName": user.userName,
            "privateGroup": post.privateGroup,
            "uploads": post.uploads,
            "createdAt": post.createdAt,
            "comments": post.comments,
        }
    } else {
        postDetails = {
            "accessibilty": post.accessibilty,
            "upvotes": post.upvotes,
            "downvotes": post.downvotes,
            "reports": post.reports,
            "spamFlag": post.spamFlag,
            "_id": post._id,
            "postContent": post.postContent,
            "postBy": post.postBy,
            "postByUserName": user.userName,
            "category": post.category,
            "uploads": post.uploads,
            "createdAt": post.createdAt,
            "comments": post.comments,
        }
    }

    let profileImage;
    if (user.profileImage) {
        profileImage = await getFileDetails(next, user.profileImage);
        postDetails.profileImage = profileImage.filename;
    }

    if (post.uploads) {
        let file = await getFileDetails(next, post.uploads)
        postDetails.fileName = file.filename;
        postDetails.fileContentType = file.contentType;
    }

    res.status(200).json({ postDetails });

});
/////////////////////////////////////////////////////////////////////////

router.get('/getcomments/:postId', async (req, res, next) => {

    const { postId } = req.params;
    let post;
    try {
        post = await Post.findById(postId).exec();
    } catch (err) {
        const error = new HttpError('Could not fetch comments for this post', 500);
        return next(error);
    }

    if (!post || post.comments.length === 0) {
        const error = new HttpError('No comments found for this post.', 404);
        return next(error);
    }

    let comments;

    comments = await Promise.all(post.comments.map(async (comment) => {
        var user;
        try {
            user = await User.findById(comment.commentBy)
        } catch (err) {
            const error = new HttpError('Could Not fetch comment details', 500);
            return next(error);
        }
        return {
            "_id": comment._id,
            "commentBody": comment.commentBody,
            "commentBy": user.userName,
            "commentByUser_id": user._id,
            "commentCreatedAt": comment.commentCreatedAt
        }
    }))


    res.status(200).json({ comments });

})


router.get('/file/:filename', (req, res, next) => {
    retrieveFile(res, next, req.params.filename);
});


// Create a new post.
router.post('/create', upload.single('file'), [check('postContent').isLength({ min: 4 })], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const { postContent, categoryId } = req.body;
    const postBy = req.user.userId;
    let uploads, newPost, existsInCategory, existsInPrivateGroups, createdpost;

    try {
        existsInCategory = await Categories.findById(categoryId);
    } catch (err) {
        const error = new HttpError('Could Not perform operation', 500);
        return next(error);
    }
    try {
        existsInPrivateGroups = await PrivateGroups.findById(categoryId);
    } catch (err) {
        const error = new HttpError('Could Not perform operation for Pg', 500);
        console.log(err)
        return next(error);
    }

    if (existsInCategory) {
        if (req.file) {
            uploads = req.file.id;
            newPost = new Post({
                postContent,
                postBy,
                accessibilty: 'public',
                category: categoryId,
                uploads
            });
        } else {
            newPost = new Post({
                postContent,
                postBy,
                accessibilty: 'public',
                category: categoryId,
            });
        }

        try {
            createdpost = await newPost.save();
        } catch (err) {
            const error = new HttpError(
                'Error while creating new post',
                500
            );
            return next(error);
        }

        try {
            await User.findByIdAndUpdate(postBy, { $push: { myPosts: createdpost._id } }).exec();
        } catch (err) {
            const error = new HttpError(
                'Error while adding new posts in myposts',
                500
            );
            return next(error);
        }


        try {
            await Categories.findByIdAndUpdate(categoryId, { $push: { posts: createdpost._id } }).exec();
        } catch (err) {
            const error = new HttpError(
                'Error while adding new post in categories',
                500
            );
            console.log(err);
            return next(error);
        }
    }
    else if (existsInPrivateGroups) {
        if (req.file) {
            uploads = req.file.id;
            newPost = new Post({
                postContent,
                postBy,
                accessibilty: 'private',
                privateGroup: categoryId,
                uploads
            });
        } else {
            newPost = new Post({
                postContent,
                postBy,
                accessibilty: 'private',
                privateGroup: categoryId,
            });
        }

        try {
            createdpost = await newPost.save();
        } catch (err) {
            const error = new HttpError(
                'Error while creating new post',
                500
            );
            return next(error);
        }

        try {
            await User.findByIdAndUpdate(postBy, { $push: { myPosts: createdpost._id } }).exec();
        } catch (err) {
            const error = new HttpError(
                'Error while adding new posts in myposts',
                500
            );
            return next(error);
        }

        try {
            await PrivateGroups.findByIdAndUpdate(categoryId, { $push: { posts: createdpost._id } }).exec();
        } catch (err) {
            const error = new HttpError(
                'Error while adding new post in Private Groups',
                500
            );
            console.log(err);
            return next(error);
        }

    }
    let user, updatedPost;

    try {
        user = await User.findById(createdpost.postBy);
    } catch (err) {
        const error = new HttpError('Encountered some error while creating your post', 500);
        return next(error);
    }
    updatedPost = {
        "accessibilty": createdpost.accessibilty,
        "upvotes": createdpost.upvotes,
        "downvotes": createdpost.downvotes,
        "reports": createdpost.reports,
        "spamFlag": createdpost.spamFlag,
        "_id": createdpost._id,
        "postContent": createdpost.postContent,
        "postBy": user.userName,
        "postByUserId": user._id,
        "category": createdpost.category,
        "uploads": createdpost.uploads,
        "createdAt": createdpost.createdAt,
        "comments": createdpost.comments,
    }
    if (user.profileImage) {
        let profileImage = await getFileDetails(next, user.profileImage);
        updatedPost.profileImage = profileImage.filename;
    }

    if (createdpost.uploads) {
        let file = await getFileDetails(next, createdpost.uploads)
        updatedPost.fileName = file.filename;
        updatedPost.fileContentType = file.contentType;
    }

    res.status(201).json({ newPost: updatedPost, message: 'Post created Successfully' });

});


//Delete post route
router.delete('/delete/:postId', authenticate, async (req, res, next) => {

    const userId = req.user.userId;
    const { postId } = req.params;

    let post;
    try {
        post = await Post.findById(postId);
    } catch (err) {
        const error = new HttpError('Could not find the post', 500);
        return next(error);
    }

    if (!(post.postBy.toString() === userId)) {
        const error = new HttpError('You are not authorized to delete this post.', 403);
        return next(error);
    }

    let deletedPost;
    try {
        deletedPost = await Post.findByIdAndDelete(postId);
    } catch (err) {
        const error = new HttpError('Could Not delete the post', 500);
        return next(error);
    }

    if (deletedPost.uploads) {
        deleteFile(next, deletedPost.uploads);
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { myPosts: postId } });
    } catch (err) {
        const error = new HttpError('Could Not perform delete operation from User', 500);
        return next(error);
    }

    if (deletedPost.accessibilty === 'private') {
        try {
            await PrivateGroups.findByIdAndUpdate(deletedPost.privateGroup, { $pull: { posts: postId } });
        } catch (err) {
            const error = new HttpError('Could Not perform delete operation from Categories', 500);
            return next(error);
        }
    }
    else {
        try {
            await Categories.findByIdAndUpdate(deletedPost.category, { $pull: { posts: postId } });
        } catch (err) {
            const error = new HttpError('Could Not perform delete operation from Categories', 500);
            return next(error);
        }
    }
    res.status(200).json({ "message": "Post has been deleted successfully." });
});

// Update/Edit post route
router.patch('/edit', [check('postContent').isLength({ min: 4 })], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const userId = req.user.userId;
    const { postContent, postId } = req.body;

    let post;

    try {
        post = await Post.findById(postId);
    } catch (err) {
        const error = new HttpError('Unable to find post', 500);
        return next(error);
    }

    if (!(post.postBy.toString() === userId)) {
        const error = new HttpError('You are not authorized to edit this post.', 403);
        return next(error);
    }


    try {
        await Post.findByIdAndUpdate(postId, { postContent: postContent });
    } catch (err) {
        const error = new HttpError('Could Not Update your post', 500);
        return next(error);
    }

    res.status(200).json({ "message": "Post has been edited successfully" });

})


//Upvotes and Downvotes seems temporary for now.
router.patch('/upvote', authenticate, async (req, res, next) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    console.log(postId)

    let post, updatedPost;
    try {
        post = await Post.findById(postId)
    } catch (err) {
        const error = new HttpError('Error while upvoting', 500);
        return next(error);
    }

    if (post.upvotes.includes(userId)) {
        const error = new HttpError('You have already upvoted this post', 400);
        return next(error);
    }

    if (post.downvotes.includes(userId)) {

        try {
            await Post.findByIdAndUpdate(postId, { $pull: { downvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while upvoting', 500);
            return next(error);
        }

    }

    try {
        updatedPost = await Post.findByIdAndUpdate(postId, { $push: { upvotes: userId } }, { new: true });
    } catch (err) {
        const error = new HttpError('Error while upvoting', 500);
        return next(error);
    }


    res.status(200).json({ message: 'Upvote Success', userId: userId, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes });

});


router.patch('/downvote', authenticate, async (req, res, next) => {

    const { postId } = req.body;
    const userId = req.user.userId;

    console.log(postId)

    let post, updatedPost;
    try {
        post = await Post.findById(postId)
    } catch (err) {
        const error = new HttpError('Error while downvoting', 500);
        return next(error);
    }

    if (post.downvotes.includes(userId)) {
        const error = new HttpError('You have already downvoted this post', 400);
        return next(error);
    }

    if (post.upvotes.includes(userId)) {
        try {
            await Post.findByIdAndUpdate(postId, { $pull: { upvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while downvoting', 500);
            return next(error);
        }
    }

    try {
        updatedPost = await Post.findByIdAndUpdate(postId, { $push: { downvotes: userId } }, { new: true });
    } catch (err) {
        const error = new HttpError('Error while upvoting', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Downvote Success', userId: userId, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes });

});


router.post('/comment', [check('commentBody').not().isEmpty()], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} or Empty value given at ${errors.array()[0].param.toLowerCase()} ,please recheck your inputs.`
            , 422
        );
        return next(err);
    }

    const { commentBody, postId } = req.body;
    const newComment = {
        commentBody,
        commentBy: req.user.userId
    }

    let post, user;
    try {
        post = await Post.findByIdAndUpdate(postId, { $push: { comments: newComment } }, { new: true });
    } catch (err) {
        const error = new HttpError('Error while inserting the comment', 500);
        return next(error);
    }

    try {
        user = await User.findById(req.user.userId);
    } catch (err) {
        const error = new HttpError('Error while adding new comment', 500);
        return next(error);
    }

    const comment = {
        "_id": post.comments[post.comments.length - 1]._id,
        "commentBody": post.comments[post.comments.length - 1].commentBody,
        "commentBy": user.userName,
        "commentByUser_id": user._id,
        "commentCreatedAt": post.comments[post.comments.length - 1].commentCreatedAt
    }

    res.status(201).json({ comment, message: "Comment added successfully" });

});


router.delete('/comment/:postId/:commentId', authenticate, async (req, res, next) => {          //

    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    let post;
    try {
        post = await Post.findById(postId);
    } catch (err) {
        const error = new HttpError('Could Not find Post', 500);
        return next(error);
    }

    let mycomment = post.comments.find((comment, index) => {
        if (comment._id.toString() === commentId) {
            return comment;
        }
    });

    if (!(mycomment.commentBy.toString() === userId)) {
        const error = new HttpError('You are unauthorized to delete the comment.', 403);
        return next(error);
    }

    try {
        await Post.findByIdAndUpdate(postId, { $pull: { comments: { _id: commentId } } });
    } catch (err) {
        const error = new HttpError('Error while deleting commenting', 500);
        return next(error);
    }

    res.status(200).json({ message: "Comment deleted successfully" });

});


router.post('/report', authenticate, async (req, res, next) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    let post;
    try {
        post = await Post.findById(postId)
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        return next(error);
    }

    if (post.reports.includes(userId)) {
        const error = new HttpError('You have already reported this post', 400);
        return next(error);
    }

    try {
        await Post.updateOne({ _id: postId }, { $push: { reports: userId } }).exec();
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        console.log(err);
        return next(error);
    }


    if (post.spamFlag == false && (post.reports.length + 1) >= 1) {
        post.spamFlag = true;
        post.save();
    }
    res.status(200).json({ 'message': 'Post has been reported for inappropriate content.' })
});


router.post('/addtoresources', authenticate, async (req, res, next) => {

    const { postId } = req.body;
    const userId = req.user.userId;

    console.log(postId)

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Unable to Fetch the user', 500);
        return next(error);
    }

    if (user.resourceBox.includes(postId)) {
        const error = new HttpError('This post already exists in your resource box', 401);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $push: { resourceBox: postId } }).exec();
    } catch (err) {
        const error = new HttpError('Could Not Add the post into Your Resource Box', 500);
        return next(error);
    }

    res.status(200).json({ 'message': 'Post has been Added to resource box' });
});

router.post('/removefromresources', authenticate, async (req, res, next) => {

    const { postId } = req.body;
    const userId = req.user.userId;

    console.log(postId)

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Unable to Fetch the user', 500);
        return next(error);
    }

    if (!user.resourceBox.includes(postId)) {
        const error = new HttpError('This post is not exists in your resource box', 401);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { resourceBox: postId } }).exec();
    } catch (err) {
        const error = new HttpError('Could Not Remove post from Your Resource Box', 500);
        return next(error);
    }

    res.status(200).json({ 'message': 'Post has been Removed to resource box' });
});


module.exports = router;