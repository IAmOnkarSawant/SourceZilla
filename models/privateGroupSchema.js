const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const privateGroupSchema = new Schema({
    groupName:{
        type:String,
        required:true,
        unique:true
    },
    members:[{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }],
    posts:[{
        type:mongoose.Types.ObjectId,
        ref:'Post'
    }],
    groupAdmin:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    passCode:{
        type:String,
        required:true
    }

});


privateGroupSchema.plugin(uniqueValidator);
mongoose.model('PrivateGroup',privateGroupSchema);
