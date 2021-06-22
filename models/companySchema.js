const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    companyName:{type:String,required:true,unique:true},
    //  followers:[{type:mongoose.Types.ObjectId,ref:'User'}], => no need
    
    interviewExperience:[{ // analogous to post
        type:mongoose.Types.ObjectId,
        ref:'InterviewExperience'
    }],
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    reports:[{
        type: mongoose.Types.ObjectId,
        ref:'User',
    }],
    spamFlag:{
        type: Boolean,
        default:false
    },
});

companySchema.plugin(uniqueValidator);
mongoose.model('Company',companySchema);