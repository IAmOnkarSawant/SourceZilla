const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    categoryName:{type:String,required:true,unique:true},
    followers:[{type:mongoose.Types.ObjectId,ref:'User'}],
    posts:[{ 
        type:mongoose.Types.ObjectId,
        ref:'Post'
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

categorySchema.plugin(uniqueValidator);
mongoose.model('Categories',categorySchema);