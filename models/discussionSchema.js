const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discussionSchema = new Schema({
    topic:{type:String,required:true},
    posts:[{type:mongoose.Types.ObjectId,ref:'Posts'}],
    parentCategory:[{type:mongoose.Types.ObjectId,ref:'Categories'}]
});

mongoose.model('Discussion',discussionSchema);