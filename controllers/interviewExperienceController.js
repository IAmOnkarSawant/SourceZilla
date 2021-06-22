const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const {validateInterviewExperience} = require('../middlewares/validations');
const HttpError = require('../models/http-error');
const { check, validationResult } = require('express-validator');

const Companies = mongoose.model('Company');
const Experiences = mongoose.model('InterviewExperience');
const User = mongoose.model('User');
const { upload, deleteUserFile, retrieveFile, getFileDetails, retrieveVideoFile } = require('../models/db');

const router = express.Router();

// create post @ /experience/create
// creates new interview experience 
router.post('/create', upload.array("myFiles",12) ,validateInterviewExperience,authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }
    const uploadedFiles = req.files; 
    const { contentUserInfo, contentPrep, contentApplication, contentRound, contentSuggestion ,companyId } = req.body;

    const experienceBy = req.user.userId;
    let uploads, newExperience, existsInCompany, createdExperience;
    
    try {
        existsInCompany = await Companies.findById(companyId);
    } catch (err) {
        const error = new HttpError('Could Not perform operation', 500);
        return next(error);
    }

    if (existsInCompany) {
        console.log(uploadedFiles);
        if (uploadedFiles.length !== 0) {
            console.log("in file section");
            
            uploads = uploadedFiles.map((file)=>{
                return file.id;
            })
            console.log("These are uploaded Files",uploads);
            newExperience = new Experiences({
                contentUserInfo,
                contentPrep,
                contentApplication,
                contentRound,
                contentSuggestion,
                interviewExperienceBy : experienceBy,
                company: companyId,
                uploads
            });
        } else {
            console.log("in no file section");
            newExperience = new Experiences({
                contentUserInfo,
                contentPrep,
                contentApplication,
                contentRound,
                contentSuggestion,
                interviewExperienceBy : experienceBy,
                company: companyId,
            });
        }

        try {
            createdExperience = await newExperience.save();
        } catch (err) {
            console.log(err);
            const error = new HttpError('Error while creating new post',500);
            return next(error);
        }
        
        try {
            await User.findByIdAndUpdate(experienceBy, { $push: { myInterviewExperience: createdExperience._id } });
        } catch (err) {
            const error = new HttpError('Error while adding new posts in myposts',500);
            return next(error);
        }

        try {
            await Companies.findByIdAndUpdate(companyId, { $push: { interviewExperience: createdExperience._id } });
        } catch (err) {
            const error = new HttpError('Error while adding new post in categories', 500);
            //console.log(err);
            return next(error);
        }
    }
    else{
        const error = new HttpError('company not found', 500);
            //console.log(err);
            return next(error);
    }
     let user, updatedExperience;

    try {
        user = await User.findById(experienceBy);
    } catch (err) {
        const error = new HttpError('Encountered some error while creating your post', 500);
        return next(error);
    }
    updatedExperience = {
        "upvotes": createdExperience.upvotes,
        "downvotes": createdExperience.downvotes,
        "reports": createdExperience.reports,
        "spamFlag": createdExperience.spamFlag,
        "_id": createdExperience._id,
        "contentUserInfo":createdExperience.contentUserInfo,
        "contentPrep":createdExperience.contentPrep,
        "contentApplication":createdExperience.contentApplication,
        "contentRound":createdExperience.contentRound,
        "contentSuggestion":createdExperience.contentSuggestion,
        "experienceBy": user.userName,
        "experineceByUserId": experienceBy,
        "company": createdExperience.company,
        "uploads": createdExperience.uploads,
        "createdAt": createdExperience.createdAt,
        "comments": createdExperience.comment
    }
    if (user.profileImage) {
        let profileImage = await getFileDetails(next, user.profileImage);
        updatedExperience.profileImage = profileImage.filename;
    }

    if (updatedExperience.uploads) {
        
        let files = [];

        files = await Promise.all(updatedExperience.uploads.map(async (upload) => {
            var myFile;
            myFile = await getFileDetails(next, upload);
            return {
                "_id": myFile._id,
                "fileName": myFile.filename,
                "contentType": myFile.contentType,
            }
        }))

        updatedExperience.files = files;
        delete updatedExperience.uploads;
    }

    res.status(201).json({ newExperience: updatedExperience, message: 'Post created Successfully' });

});



// get route @ /experience/:companyId
// loads all the posts of the of perticular company
router.get('/all/:companyId', async(req, res, next)=>{

    const { companyId } = req.params;

    let experiences;
    
    try{
        experiences = await Companies.findById(companyId).populate({path:'interviewExperience',select:'contentUserInfo interviewExperienceBy createdAt upvotes spamFlag'}).exec();
    }
    catch(err){
        const error = new HttpError("Unable to fetch experiences",500);
        return next(error);
    }
    // console.log(experiences);
    res.status(200).json({experiences : experiences.interviewExperience});
});

// get route @ /experience/latest/:companyId
// loads all the posts of the of perticular company according to date
router.get('/latest/:companyId', async(req, res, next)=>{
    const { companyId } = req.params;

    let experiences;
    try{
        experiences = await Companies.findById(companyId).populate({path : 'interviewExperience', select:'contentUserInfo interviewExperienceBy createdAt upvotes spamFlag'}).sort({ _id: -1 }).exec();
    }
    catch(err){
        const error = new HttpError("Unable to fetch experiences",500);
        return next(error);
    }
    console.log(typeof(experiences));
    res.status(200).json({experiences : experiences.interviewExperience});
});

// get route @ /experience/oldest/:companyId
// loads all the posts of the of perticular company according to date reverse way
router.get('/oldest/:companyId', async(req, res, next)=>{
    const { companyId } = req.params;

    let experiences;
    try{
        experiences = await Companies.findById(companyId).populate({path : 'interviewExperience', select:'contentUserInfo interviewExperienceBy createdAt upvotes spamFlag'}).sort({ _id: 1 }).exec();
    }
    catch(err){
        const error = new HttpError("Unable to fetch experiences",500);
        return next(error);
    }
    console.log(typeof(experiences));
    res.status(200).json({experiences : experiences.interviewExperience});
});

// get route @ /experience/popular/:companyId
// loads all the posts of the of perticular company according to likes of the post
router.get('/popular/:companyId', async(req, res, next)=>{
    const { companyId } = req.params;

    let experiences;
    try{
        experiences = await Companies.findById(companyId).populate({path : 'interviewExperience', select:'contentUserInfo interviewExperienceBy createdAt upvotes spamFlag'}).sort('upvotes.length').exec();
    }
    catch(err){
        const error = new HttpError("Unable to fetch experiences",500);
        return next(error);
    }
    console.log(typeof(experiences));
    res.status(200).json({experiences : experiences.interviewExperience});
});

// get post @ /experience/:companyId/:experienceId
// opens the Experience 
router.get('/getExperience/:experienceId', authenticate, async (req, res, next) => {

    let experience , user;
    let experiencesId = req.params.experienceId;
    try{
        experience = await Experiences.findById(experiencesId);
    }
    catch (err){
        const error = new HttpError('Unable to fetch this experience', 500);
        return next(error);
    }

    try {
        user = await User.findById(experience.interviewExperienceBy);
    } catch (err) {
        const error = new HttpError('Unable to perform this operation', 500);
        return next(error);
    }
    //console.log(user);

    let experienceDetails;
    experienceDetails = {
        "_id" : experience._id,
        "contentUserInfo" : experience.contentUserInfo,
        "contentPrep" : experience.contentPrep,
        "contentApplication" : experience.contentApplication,
        "contentRound" : experience.contentRound,
        "contentSuggestion" : experience.contentSuggestion,
        "interviewExperienceBy" : experience.interviewExperienceBy,
        "UserName" : user.userName,
        "uploads" : experience.uploads,
        "createdAt" : experience.createdAt,
        "comments" : experience.comments,
        "upvotes" : experience.upvotes,
        "downvotes" : experience.downvotes,
        "reports" : experience.reports,
        "spamFlag" : experience.spamFlag,
    }

    let profileImage;
    if (user.profileImage) {
        profileImage = await getFileDetails(next, user.profileImage);
        experienceDetails.profileImage = profileImage.filename;
    }

    if (experience.uploads) {
        let file = await getFileDetails(next, experience.uploads)
        experienceDetails.fileName = file.filename;
        experienceDetails.fileContentType = file.contentType;
    }

    res.status(200).json({ experienceDetails });
});

// get comments @ /experience/getcomments/:experienceId
// loads the comments of the experience if any. 

router.get('/getcomments/:experienceId', async (req, res, next) => {

    const experienceId  = req.params.experienceId;
    let experience;
    try {
        experience = await Companies.findById(experienceId).exec();
    } catch (err) {
        const error = new HttpError('Could not fetch comments for this Post', 500);
        return next(error);
    }

    if (!experience || experience.comments.length === 0) {
        const error = new HttpError('No comments found for this post.', 404);
        return next(error);
    }

    let comments;

    comments = await Promise.all(experience.comments.map(async (comment) => {
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
});

router.get('/file/:filename', (req, res, next) => {
    retrieveFile(res, next, req.params.filename);
});

// edit experience @ /experience/edit/:experienceId
// edits the experience 

router.patch('/edit', authenticate, async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const userId = req.user.userId;
    const { contentUserInfo, contentPrep, contentApplication, contentRound, contentSuggestion, experienceId } = req.body;

    let experience;
    try {
        experience = await Experiences.findById(experienceId);
    } catch (err) {
        const error = new HttpError('Unable to find post', 500);
        return next(error);
    }

    if ((experience.interviewExperienceBy.toString() !== userId)) {
        const error = new HttpError('You are not authorized to edit this post.', 403);
        return next(error);
    }


    try {
        await Experiences.findByIdAndUpdate(
            experienceId, { 
                        contentUserInfo : contentUserInfo, 
                        contentPrep : contentPrep ,
                        contentApplication : contentApplication,
                        contentRound : contentRound,
                        contentSuggestion : contentSuggestion,
                        });
    } catch (err) {
        const error = new HttpError('Could Not Update your post', 500);
        return next(error);
    }

    res.status(200).json({ "message": "Post has been edited successfully" });
})

// upvotes the experience 
router.patch('/upvote', authenticate, async (req, res, next) => {
    const { experienceId } = req.body;
    const userId = req.user.userId;

    //console.log(experienceId)

    let experience, updatedExperience;
    try {
        experience = await Experiences.findById(experienceId)
    } catch (err) {
        const error = new HttpError('Error while upvoting', 500);
        return next(error);
    }


    if (experience.downvotes.includes(userId)) {

        try {
            await Experiences.findByIdAndUpdate(experienceId, { $pull: { downvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while upvoting', 500);
            return next(error);
        }

    }

    if (experience.upvotes.includes(userId)) {

        try {
            updatedExperience = await Experiences.findByIdAndUpdate(experienceId, { $pull: { upvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while upvoting', 500);
            return next(error);
        }

    } else {

        try {
            updatedExperience = await Experiences.findByIdAndUpdate(experienceId, { $addToSet: { upvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while upvoting', 500);
            return next(error);
        }
    }

    res.status(200).json({ message: 'Upvote Success', userId: userId, upvotes: updatedExperience.upvotes, downvotes: updatedExperience.downvotes });
});


router.patch('/downvote', authenticate, async (req, res, next) => {

    const { experienceId } = req.body;
    const userId = req.user.userId;

    let experience, updatedExperience;
    try {
        experience = await Experiences.findById(experienceId)
    } catch (err) {
        const error = new HttpError('Error while downvoting', 500);
        return next(error);
    }


    if (experience.upvotes.includes(userId)) {
        try {
            await Experiences.findByIdAndUpdate(experienceId, { $pull: { upvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while downvoting', 500);
            return next(error);
        }
    }

    if (experience.downvotes.includes(userId)) {

        try {
            updatedExperience = await Experiences.findByIdAndUpdate(experienceId, { $pull: { downvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while upvoting', 500);
            return next(error);
        }

    } else {

        try {
            updatedExperience = await Experiences.findByIdAndUpdate(experienceId, { $addToSet: { downvotes: userId } }, { new: true });
        } catch (err) {
            const error = new HttpError('Error while upvoting', 500);
            return next(error);
        }

    }

    res.status(200).json({ message: 'Downvote Success', userId: userId, upvotes: updatedExperience.upvotes, downvotes: updatedExperience.downvotes });

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

    const { commentBody, experienceId } = req.body;
    const newComment = {
        commentBody,
        commentBy: req.user.userId
    }

    let experience, user;
    try {
        experience = await Experiences.findByIdAndUpdate(experienceId, { $push: { comments: newComment } }, { new: true });
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
        "_id": experience.comments[experience.comments.length - 1]._id,
        "commentBody": experience.comments[experience.comments.length - 1].commentBody,
        "commentBy": user.userName,
        "commentByUser_id": user._id,
        "commentCreatedAt": experience.comments[experience.comments.length - 1].commentCreatedAt
    }

    res.status(201).json({ comment, message: "Comment added successfully" });

});


router.delete('/comment/:experienceId/:commentId', authenticate, async (req, res, next) => {          //

    const { experienceId, commentId } = req.params;
    const userId = req.user.userId;

    let experience;
    try {
        experience = await Experiences.findById(experienceId);
    } catch (err) {
        const error = new HttpError('Could Not find Post', 500);
        return next(error);
    }

    let mycomment = experience.comments.find((comment, index) => {
        if (comment._id.toString() === commentId) {
            return comment;
        }
    });

    if (!(mycomment.commentBy.toString() === userId)) {
        const error = new HttpError('You are unauthorized to delete the comment.', 403);
        return next(error);
    }

    try {
        await Experiences.findByIdAndUpdate(experienceId, { $pull: { comments: { _id: commentId } } });
    } catch (err) {
        const error = new HttpError('Error while deleting commenting', 500);
        return next(error);
    }

    res.status(200).json({ message: "Comment deleted successfully" });

});


router.post('/report', authenticate, async (req, res, next) => {
    const { experienceId } = req.body;
    const userId = req.user.userId;

    let experience;
    try {
        experience = await Experiences.findById(experienceId)
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        return next(error);
    }

    if (experience.reports.includes(userId)) {
        const error = new HttpError('You have already reported this post', 400);
        return next(error);
    }

    try {
        await Experiences.updateOne({ _id: experienceId }, { $push: { reports: userId } }).exec();
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        //console.log(err);
        return next(error);
    }


    if (experience.spamFlag == false && (experience.reports.length + 1) >= 1) {
        experience.spamFlag = true;
        experience.save();
    }
    res.status(200).json({ experience,'message': 'Post has been reported for inappropriate content.' })
});


router.post('/addtoresources', authenticate, async (req, res, next) => {

    const { experienceId } = req.body;
    const userId = req.user.userId;

    //console.log(experienceId)

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Unable to Fetch the user', 500);
        return next(error);
    }

    if (user.resourceBox.includes(experienceId)) {
        const error = new HttpError('This post already exists in your resource box', 401);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $push: { resourceBox: experienceId } }).exec();
    } catch (err) {
        const error = new HttpError('Could Not Add the post into Your Resource Box', 500);
        return next(error);
    }

    res.status(200).json({ user,'message': 'Post has been Added to resource box' });
});

router.post('/removefromresources', authenticate, async (req, res, next) => {

    const { experienceId } = req.body;
    const userId = req.user.userId;

    //console.log(experienceId)

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError('Unable to Fetch the user', 500);
        return next(error);
    }

    if (!user.resourceBox.includes(experienceId)) {
        const error = new HttpError('This post is not exists in your resource box', 401);
        return next(error);
    }

    try {
        await User.findByIdAndUpdate(userId, { $pull: { resourceBox: experienceId } }).exec();
    } catch (err) {
        const error = new HttpError('Could Not Remove post from Your Resource Box', 500);
        return next(error);
    }

    res.status(200).json({ user, 'message': 'Post has been Removed to resource box' });
});




module.exports = router;