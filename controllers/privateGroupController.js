const express = require('express');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Post = mongoose.model('Post');
const PrivateGroups = mongoose.model('PrivateGroup');

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const authenticate = require('../middlewares/authenticate');
const HttpError = require('../models/http-error');
const { check, validationResult } = require('express-validator');
const { getFileDetails } = require('../models/db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    let groups;
    const outgroup = [];
    try {
        groups = await PrivateGroups.find({}).sort({ _id: -1 }).populate('groupAdmin')
    } catch (err) {
        const error = new HttpError('Could Not fetch the private groups', 500);
        return next(error);
    }

    groups.forEach((group) => {
        const g = {
            "_id": group._id,
            "groupName": group.groupName,
            "groupAdmin": group.groupAdmin.userName,
            "groupAdminId": group.groupAdmin._id,
            "groupMembers": group.members.length
        }
        outgroup.push(g);
    })

    res.status(200).json({ groups: outgroup });

});

router.get('/view/:privateGroupId', authenticate, async (req, res, next) => {

    const { privateGroupId } = req.params;
    const userId = req.user.userId;

    let group, updatedPosts, userPost;
    try {
        group = await PrivateGroups.findById(privateGroupId).populate('posts').exec();
    } catch (err) {
        const error = new HttpError('Could Not fetch the private groups', 500);
        return next(error);
    }

    if (!group.members.includes(userId)) {
        const error = new HttpError('You have to be a member of this group to access its contents.', 403);
        return next(error);
    }

    let file = {};
    updatedPosts = await Promise.all(group.posts.map(async (post) => {
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
                postByUserId: post.postBy,
                postContent: post.postContent,
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
                postByUserId: post.postBy,
                postContent: post.postContent,
                createdAt: post.createdAt,
                comments: post.comments,
            }
        }

    }))

    updatedPosts = await Promise.all(updatedPosts.map(async (post) => {

        let profileImage;
        try {
            user = await User.findById(post.postByUserId);
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


    const outgroup = {
        "_id": group._id,
        "groupName": group.groupName,
        "members": group.members.length,
        "posts": updatedPosts
    }

    res.status(200).json({ groupsPosts: outgroup.posts });

});

router.post('/create', [check('groupName').not().isEmpty()], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const { groupName } = req.body;
    const groupAdmin = req.user.userId;

    let existingGroup;


    try {
        existingGroup = await PrivateGroups.findOne({ groupName });
    } catch (err) {
        const error = new HttpError('Creation failed due to Unknown error,please try again.', 500);
        return next(error);
    }

    if (existingGroup) {
        const error = new HttpError('The group you are trying to create exists already.', 400);
        return next(error);
    }

    const passCode = passCodeGenerator();
    let hashedpasscode;
    try {
        hashedpasscode = await bcrypt.hash(passCode, 10);
    } catch (err) {
        const error = new HttpError('A server error occured', 500);
        return next(error);
    }

    const newGroup = new PrivateGroups({
        groupName,
        groupAdmin,
        passCode: hashedpasscode
    });

    let group;
    try {
        group = await newGroup.save();
    } catch (err) {
        const error = new HttpError('Not able to create new Group,please try again.', 500);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(groupAdmin, { $push: { myPrivateGroups: group._id } })
    } catch (err) {
        const error = new HttpError('Some error occured while processing your request.', 500);
        return next(error);
    }

    let outgroup;
    try {
        outgroup = await PrivateGroups.findByIdAndUpdate(group._id, { $push: { members: groupAdmin } }, { new: true });
    } catch (err) {
        const error = new HttpError('Some error occured while processing your request.', 500);
        return next(error);
    }

    let admin;
    try {
        admin = await User.findById(outgroup.groupAdmin);
    } catch (err) {
        const error = new HttpError('Some error occured while processing your request.', 500);
        return next(error);
    }

    const newGroupDetails = {
        "members": outgroup.members,
        "posts": outgroup.posts,
        "_id": outgroup._id,
        "groupName": outgroup.groupName,
        "groupAdmin": admin.userName,
        "groupAdminId": admin._id
    }

    res.status(200).json({ "message": "New Group has been created successfully.", "passcode": passCode, newGroupDetails });

});

router.post('/join', [check('passCode').isLength(8)], authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const userId = req.user.userId;
    const { privateGroupId, passCode } = req.body;

    let group;
    try {
        group = await PrivateGroups.findById(privateGroupId);
    } catch (err) {
        const error = new HttpError('Error encountered', 500);
        return next(error);
    }

    if (group.members.includes(userId)) {
        const error = new HttpError('You are already a member of this group.', 401);
        return next(error);
    }

    let isValidPassCode = false;
    try {
        isValidPassCode = await bcrypt.compare(passCode, group.passCode);
    } catch (err) {
        const error = new HttpError('Could Not Add you,please try again', 500);
        return next(error);
    }

    if (!isValidPassCode) {
        const error = new HttpError('Invalid Passcode.Please Try Again', 401);
        return next(error);
    }

    let groupInfo, admin;
    try {
        groupInfo = await PrivateGroups.findByIdAndUpdate(group._id, { $push: { members: userId } }, { new: true }).exec();
    } catch (err) {
        const error = new HttpError('Could not add you as a member', 500);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $push: { myPrivateGroups: group._id } });
    } catch (err) {
        const error = new HttpError('Could not update your private categories', 500);
        return next(error);
    }

    try {
        admin = await User.findById(group.groupAdmin);
    } catch (err) {
        const error = new HttpError('Unable to perform your operation', 500);
        return next(error);
    }

    const updatedGroupInfo = {
        "members": group.members,
        "posts": group.posts,
        "_id": group._id,
        "groupName": group.groupName,
        "groupAdmin": admin.userName,
        "groupAdminId": group.groupAdmin,
    }
    res.status(200).json({ "message": "Access Granted.You are now a member of this group.", groupInfo: updatedGroupInfo });

});

router.patch('/leave', authenticate, async (req, res, next) => {

    const userId = req.user.userId;
    const { privateGroupId } = req.body;
    let group, newAdmin;

    try {
        group = await PrivateGroups.findById(privateGroupId);
    } catch (err) {
        const error = new HttpError('Could Not perform your request.', 500);
        return next(error);
    }

    //if group leaver is admin
    if (group.groupAdmin.toString() === userId) {
        if (group.members.length > 1) {
            const index = group.members.indexOf(group.groupAdmin);
            newAdmin = group.members[index + 1];
            try {
                await PrivateGroups.findByIdAndUpdate(privateGroupId, { $pull: { members: group.groupAdmin } })
            } catch (err) {
                const error = new HttpError('Could Not perform your operation 1', 500);
                return next(error);
            }
            try {
                await PrivateGroups.findByIdAndUpdate(privateGroupId, { groupAdmin: newAdmin });
            } catch (err) {
                const error = new HttpError('Could Not perform your operation 2', 500);
                return next(error);
            }
        } else {
            try {
                await PrivateGroups.findByIdAndDelete(privateGroupId);
            } catch (err) {
                const error = new HttpError('Could Not perform your operation 3.', 500);
                return next(error);
            }
        }

    } else {
        try {
            await PrivateGroups.findByIdAndUpdate(privateGroupId, { $pull: { members: userId } })
        } catch (err) {
            const error = new HttpError('Could Not perform your operation 4', 500);
            return next(error);
        }
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { myPrivateGroups: privateGroupId } });
    } catch (err) {
        const error = new HttpError('Could Not perform your operation properly 5.', 500);
        return next(error);
    }

    res.status(200).json({ "message": "You are no longer a member of this group." });

});

router.delete('/delete', authenticate, async (req, res, next) => {

    const userId = req.user.userId;
    const { privateGroupId } = req.body;
    let group, posts;
    try {
        group = await PrivateGroups.findById(privateGroupId);

    } catch (err) {
        const error = new HttpError('Encountered error while processing your request', 500);
        return next(error);
    }

    // console.log(group.groupAdmin);
    if (!(group.groupAdmin.toString() === userId)) {
        const error = new HttpError('Your are not Authorized to Delete this Personal Group', 401);
        return next(error);
    }

    try {
        await PrivateGroups.findByIdAndDelete(privateGroupId);
    } catch (err) {
        const error = new HttpError('Could Not perform your operation.', 500);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { myPrivateGroups: privateGroupId } });
    } catch (err) {
        const error = new HttpError('Could Not perform your operation properly.', 500);
        return next(error);
    }

    group.members.forEach(async (member) => {
        try {
            await User.findByIdAndUpdate(member, { $pull: { myPrivateGroups: privateGroupId } });
        } catch (err) {
            const error = new HttpError('Could Not perform your operation properly', 500);
            return next(error);
        }
    });

    try {
        posts = await Post.find({ privateGroup: privateGroupId });
    } catch (err) {
        const error = new HttpError('Could Not perform your operation properly', 500);
        return next(error);
    }

    posts.forEach(async (post) => {
        try {
            await Post.findByIdAndDelete(post._id);
        } catch (err) {
            const error = new HttpError('Could Not Perform your operation properly p', 500);
            return next(error);
        }
        try {
            await User.findByIdAndUpdate(post.postBy, { $pull: { myPosts: post._id } });
        } catch (err) {
            const error = new HttpError('Could Not Perform your operation properly p', 500);
            return next(error);
        }
    });

    res.status(200).json({ "message": "Deletion Successful" });
});


const passCodeGenerator = () => {
    const length = 8;
    const passcode = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
    return passcode;
}

module.exports = router;