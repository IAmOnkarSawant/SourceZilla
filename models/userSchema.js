const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage: {
        type: mongoose.Types.ObjectId,
        ref: 'uploads.files',
        // default: '5f8ef2a1e8778c656850d2ea'
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    myPosts: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    myInterviewExperience: [{type: mongoose.Types.ObjectId, ref: 'Experiences'}],
    resourceBox: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    categoriesFollowed: [{ type: mongoose.Types.ObjectId, ref: 'Categories' }],
    myPrivateGroups: [{ type: mongoose.Types.ObjectId, ref: 'PrivateGroup' }],


    socialHandles: {
        github: { type: String },
        linkedIn: { type: String },
        twitter: { type: String }
    }
});

userSchema.plugin(uniqueValidator);
mongoose.model('User', userSchema);