const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = mongoose.model('User');

const interviewExperienceSchema = new Schema({
    
    //I.E. = interview Experience
    contentUserInfo: {
        role: {type: String, required: true,},
        passoutYear: {type: Number},
        branch: {type: String, required: true,},
        introduction: {type: String},
        status: {type: Number, default: 2} // 0=> rejected / 1=> selected / 2=> not known
    },
    contentPrep: {
        type: String,
        required: true,
    },  
    contentApplication: {
        type: String,
        required: true,
    },
    contentRound: [{
        roundName: {type: String,required: true,},
        description : {type: String},
        tips: {type: String},
    }], 

    contentSuggestion: {
        type: String,
        required: true,
    },
    interviewExperienceBy: {
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    uploads: [{
        type: mongoose.Types.ObjectId,
        ref: 'GridFs'
    }],
    upvotes: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    downvotes: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        commentBody: { type: String, required: true },
        commentBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        commentCreatedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    reports: [{
        type: mongoose.Types.ObjectId,
        ref:'User',
    }],
    spamFlag: {
        type: Boolean,
        default:false
    },
});

mongoose.model('InterviewExperience',interviewExperienceSchema);