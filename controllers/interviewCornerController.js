const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const HttpError = require('../models/http-error');
const { check, validationResult } = require('express-validator');

const Companies = mongoose.model('Company');
const router = express.Router();

// Get Route company names @ /interviewCorner/
router.get('/', async (req, res, next)=>{
    let companies;
    
    try {
        companies = await Companies.find().sort({_id: -1}).exec()

    } catch (err) {
        const error = new HttpError('Unable to fetch the company names', 500);
        return next(error);
    }
    res.status(200).json({companies: companies});
});

// GET Route @ /interviewCorner/latest
// Returns top 10 latest added companies.
router.get('/latest', async (req, res, next) => {
    let companies;
    try {
        companies = await Companies.find().sort({ _id: -1 }).limit(10).exec();
    } catch (err) {
        const error = new HttpError('Unable to sort by latest', 500);
        return next(error);
    }

    res.status(200).json({ companies: companies });
});

//GET Route @ /interviewCorner/oldest
// Returns top 10 oldest added companies.
router.get('/oldest', async (req, res, next) => {
    let companies;
    try {
        companies = await Companies.find().sort({ _id: 1 }).limit(10).exec();
    } catch (err) {
        const error = new HttpError('Unable to sort by oldest', 500);
        return next(error);
    }
    res.status(200).json({ companies: companies });
});

//GET Route @ /interviewCorner/popular
// Returns most popular company based on number of experiences.
router.get('/popular', async (req, res, next) => {
    let companies;
    try {
        companies = await Companies.aggregate([
            { $unwind: "$Experience" }, {
                $group: {
                    _id: '$_id', "companyName": { "$first": "$companyName" }, "spamFlag": { "$first": "$spamFlag" }
                    , "createdBy": { "$first": "$createdBy" }, experiencecount: { $sum: 1 }, experience: { $addToSet: "$interviewExperience" }, 
                    reports: { $first: "$reports" }
                }
            },
            { $sort: { experiencecount: -1 } }
        ])
    } catch (err) {
        const error = new HttpError('Unable to process your request.', 500);
        console.log(err)
        return next(error);
    }
    res.status(200).json({ companies: companies });
});

//GET Route @ /interviewCorner/add
// searching a company
router.get('/search', [check('companyName').not().isEmpty()], /*authenticate,*/ async( req, res, next)=>{
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }
    console.log("in search");
    const { companyName } = req.body;
    let existingcompany;
    const resultant = {
        message: '',
        company: {},
    }

    try {
        existingcompany = await Companies.findOne({ companyName });
    } catch (err) {
        const error = new HttpError('Creation failed due to Unknown error,please try again.', 500);
        return next(error);
    }

    if (existingcompany) {
        resultant.message = 'Here is what I have found!.'
        resultant.company = existingcompany;
        return res.status(400).json({
            message: resultant.message,
            company: resultant.company
        });
    }
    else{
        const error = new HttpError('The Company you are trying to search doesnot exsist.', 404);
        return next(error);
    }
});

// GET Route @ /interviewCorner/addCompany
// adding a company
router.post('/add', [check('companyName').not().isEmpty()], authenticate, async (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new HttpError(
            `${errors.array()[0].msg} given at ${errors.array()[0].param.toLowerCase()} ,please recheck your data.`
            , 422)
        return next(err);
    }

    const { companyName } = req.body;
    const createdBy = req.user.userId;
    let existingCompany;
    const resultant = {
        message: '',
        company: {},
    }
    
    try {
        existingCompany = await Companies.findOne({ companyName });
    } catch (err) {
        const error = new HttpError('Creation failed due to Unknown error,please try again.', 500);
        return next(error);
    }

    if (existingCompany) {
        resultant.message = 'The company you are trying to create exists already.'
        resultant.company = existingCompany;
        return res.status(400).json({
            message: resultant.message,
            company: resultant.company
        });
    }

    const newCompany = new Companies({
        companyName,
        createdBy,
    });

    let cate;
    try {
        cate = await newCompany.save();
    } catch (err) {
        const error = new HttpError('Not able to create new company,please try again.', 500);
        return next(error);
    }

    let newCate;
    try {
        newCate = await Companies.findByIdAndUpdate(cate._id, { new: true })
    } catch (err) {
        const error = new HttpError('Unable to create new company, please try again', 500);
        return next(error);
    }

    resultant.message = 'New company has been created successfully.'
    resultant.company = newCate;

    res.status(200).json({
        message: resultant.message,
        company: resultant.company,
    });

});


//POST Route @ /interviewCorner/report
// reports the company and if sets spam flag if required
router.post('/report',authenticate, async (req, res, next) => {

    const { companyId } = req.body;
    const userId = req.user.userId;

    let company;
    try {
        company = await Companies.findById(companyId)
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        return next(error);
    }

    if (company.reports.includes(userId)) {
        const error = new HttpError('You have already reported this company', 400);
        return next(error);
    }

    try {
        await Companies.updateOne({ _id: companyId }, { $push: { reports: userId } }).exec();
    } catch (err) {
        const error = new HttpError('Error while reporting', 500);
        return next(error);
    }

    if (company.spamFlag == false && (company.reports.length + 1) >= 1) {

        company.spamFlag = true;
        company.save();
    }
    res.status(200).json({ 'message': 'company has been reported for inappropriate content.' })
});

module.exports = router;