const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    postContent: {
        type: String,
        required: true,
    },
    postBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    accessibilty: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Categories',
        required: function () { return this.accessibilty === 'public' }
    },
    privateGroup: {
        type: mongoose.Types.ObjectId,
        ref: 'PrivateGroup',
        required: function () { return this.accessibilty === 'private' }
    },
    uploads: {
        type: mongoose.Types.ObjectId,
        ref: 'GridFs'
    },
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
        ref: 'User',
    }],
    spamFlag: {
        type: Boolean,
        default: false
    }
});


mongoose.model('Post', postSchema);