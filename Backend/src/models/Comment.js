const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

commentSchema.index({ complaint: 1, createdAt: -1 }); // Index for fetching comments

module.exports = mongoose.model('Comment', commentSchema);
