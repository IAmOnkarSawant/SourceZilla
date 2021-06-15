const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const HttpError = require('../models/http-error');
const { check, validationResult } = require('express-validator');

const Categories = mongoose.model('Categories');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

const { getFileDetails } = require('../models/db');

const router = express.Router();

// GET Route /category
//gets all categories
router.get('/', async (req, res, next) => {

    let categories;
    try {
        categories = await Categories.find().sort({ _id: -1 }).exec()

    } catch (err) {
        const error = new HttpError('Unable to fetch all categories', 500);
        return next(error);
    }
    res.status(200).json({ categories: categories });
});

//GET Route @ category/latest
// Returns top 10 latest added Categories.
router.get('/latest', async (req, res, next) => {
    let categories;
    try {
        categories = await Categories.find().sort({ _id: -1 }).limit(10).exec();
    } catch (err) {
        const error = new HttpError('Unable to sort by latest', 500);
        return next(error);
    }

    res.status(200).json({ categories: categories });
});

//GET Route @ category/oldest
// Returns top 10 oldest added Categories.
router.get('/oldest', async (req, res, next) => {
    let categories;
    try {
        categories = await Categories.find().sort({ _id: 1 }).limit(10).exec();
    } catch (err) {
        const error = new HttpError('Unable to sort by oldest', 500);
        return next(error);
    }
    res.status(200).json({ categories: categories });
});

//GET Route @ category/popular
// Returns most popular Categories.
router.get('/popular', async (req, res, next) => {
    let categories;
    try {
        categories = await Categories.aggregate([
            { $unwind: "$posts" }, {
                $group: {
                    _id: '$_id', "categoryName": { "$first": "$categoryName" }, "spamFlag": { "$first": "$spamFlag" }
                    , "createdBy": { "$first": "$createdBy" }, postscount: { $sum: 1 }, posts: { $addToSet: "$posts" }, followers: { $first: "$followers" },
                    reports: { $first: "$reports" }
                }
            },
            { $sort: { postscount: -1 } }
        ])
    } catch (err) {
        const error = new HttpError('Unable to process your request.', 500);
        console.log(err)
        return next(error);
    }
    res.status(200).json({ categories: categories });
});

// Edited
router.get('/followedCategories/:page', authenticate, async (req, res, next) => {
    const page = parseInt(req.params.page, 10)
    const limit = 4
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // const endIndex = page * limit;

    let followedCategories;
    let CountFollowedCategories;
    try {
        followedCategories = await Categories.find({ 'followers': mongoose.Types.ObjectId(req.user.userId) })
            .sort({ _id: 'asc' })
            .limit(limit)
            .skip(startIndex)
            .exec()

        CountFollowedCategories = await Categories.find({ 'followers': mongoose.Types.ObjectId(req.user.userId) })
            .countDocuments()
            .exec()
    } catch (err) {
        const error = new HttpError('Unable to process your request', 500);
        return next(error);
    }

    res.status(200).json({ categories: followedCategories, CountFollowedCategories });
});

// GET Route @ category/:id
// Returns one category with all its posts
router.get('/getposts/:categoryId/:page', async (req, res, next) => {
    const { categoryId } = req.params;

    const page = parseInt(req.params.page, 10)
    const limit = 2
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let category, updatedPosts, userPost;
    try {
        category = await Categories.findById(categoryId)
            .populate({
                path: 'posts',
                options: {
                    sort: { _id: -1 }
                }
            })
            .exec()
    } catch (err) {
        const error = new HttpError('Could Not fetch the categories', 500);
        return next(error);
    }

    let file = {};
    updatedPosts = await Promise.all(category.posts.map(async (post) => {
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
                postByUserId: post.postBy,
                createdAt: post.createdAt,
                comments: post.comments,
                fileName: file.filename,
                file_id: file._id,
                fileContentType: file.contentType
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
                postByUserId: post.postBy,
                createdAt: post.createdAt,
                comments: post.comments,
            }
        }

    }))

    updatedPosts = await Promise.all(updatedPosts.map(async (post) => {

        let profileImage;
        try {
            var user = await User.findById(post.postByUserId);
            // console.log(user);
        } catch (err) {
            const error = new HttpError('Unable to perform your operation', 500);
            return next(error);
        }
        if (user.profileImage) {
            profileImage = await getFileDetails(next, user.profileImage);
            post.profileImage = profileImage.filename;

        }
        post.postBy = user.userName;
        return post;

    }))

    let outcategory = {
        "_id": category._id,
        "categoryName": category.categoryName,
        "followers": category.followers.length,
        "posts": updatedPosts.slice(startIndex, endIndex)
    }

    res.status(200).json({ category: outcategory });
});

router.post('/', [check('categoryName').not().isEmpty()], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const { categoryName } = req.body;
    const createdBy = req.user.userId;
    let existingCategory;
    const resultant = {
        message: '',
        category: {},
    }

    try {
        existingCategory = await Categories.findOne({ categoryName });
    } catch (err) {
        const error = new HttpError('Creation failed due to Unknown error,please try again.', 500);
        return next(error);
    }

    if (existingCategory) {
        resultant.message = 'The category you are trying to create exists already.Please consider following it instead.'
        resultant.category = existingCategory;
        return res.status(400).json({
            message: resultant.message,
            category: resultant.category
        });
    }

    const newCategory = new Categories({
        categoryName,
        createdBy
    });

    let cate;
    try {
        cate = await newCategory.save();
    } catch (err) {
        const error = new HttpError('Not able to create new Category,please try again.', 500);
        return next(error);
    }

    let newCate;
    try {
        newCate = await Categories.findByIdAndUpdate(cate._id, { $push: { followers: cate.createdBy } }, { new: true })
    } catch (err) {
        const error = new HttpError('Unable to create new Category,please try again', 500);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(createdBy, { $push: { categoriesFollowed: cate._id } });
    } catch (err) {
        const error = new HttpError('Unable to create new Category,please try again', 500);
        return next(error);
    }

    resultant.message = 'New Category has been created successfully.'
    resultant.category = newCate;

    res.status(200).json({
        message: resultant.message,
        category: resultant.category,
    });

});

router.post('/report', authenticate, async (req, res, next) => {

    const { categoryId } = req.body;
    const userId = req.user.userId;

    let category;
    try {
        category = await Categories.findById(categoryId)
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        return next(error);
    }

    if (category.reports.includes(userId)) {
        const error = new HttpError('You have already reported this category', 400);
        return next(error);
    }

    try {
        await Categories.updateOne({ _id: categoryId }, { $push: { reports: userId } }).exec();
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        return next(error);
    }

    if (category.spamFlag == false && (category.reports.length + 1) >= 1) {

        category.spamFlag = true;
        category.save();

    }
    res.status(200).json({ 'message': 'Category has been reported for inappropriate content.' })
});

router.patch('/follow/:categoryId', authenticate, async (req, res, next) => {

    const userId = req.user.userId;
    const { categoryId } = req.params;

    console.log("Follow : ", categoryId)
    let user;

    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Could Not Fetch User', 500);
        console.log(err);
        return next(error);
    }

    if (user.categoriesFollowed.includes(categoryId)) {
        const error = new HttpError('You have already followed this category', 401);
        return next(error);
    }

    try {
        await Categories.findByIdAndUpdate(categoryId, { $push: { followers: userId } });
    } catch (err) {
        const error = new HttpError('Error while following', 500);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $push: { categoriesFollowed: categoryId } });
    } catch (err) {
        const error = new HttpError('Error while following', 500);
        return next(error);
    }

    res.status(200).json({ userId: req.user.userId, 'message': 'You have followed a new category.' });

});

router.patch('/unfollow/:categoryId', authenticate, async (req, res, next) => {

    const userId = req.user.userId;
    const { categoryId } = req.params;
    console.log(categoryId)

    console.log("UnFollow : ", categoryId)

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Could Not Fetch User', 500);
        console.log(err);
        return next(error);
    }

    if (!(user.categoriesFollowed.includes(categoryId))) {
        const error = new HttpError(`You don't follow this category in order to follow.`, 401);
        return next(error);
    }

    let category;
    try {
        category = await Categories.findById(categoryId);
    } catch (err) {
        const error = new HttpError(`Unable to perform your operation.`, 500);
        return next(error);
    }

    if (category.createdBy.toString() === userId) {
        const error = new HttpError(`You can't unfollow your created category`, 401);
        return next(error);
    }

    try {
        await Categories.findByIdAndUpdate(categoryId, { $pull: { followers: userId } });
    } catch (err) {
        const error = new HttpError('Error while following', 500);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { categoriesFollowed: categoryId } });
    } catch (err) {
        const error = new HttpError('Error while following', 500);
        return next(error);
    }

    res.status(200).json({ userId: req.user.userId, 'message': 'You have unfollowed this category.' });

});

module.exports = router;