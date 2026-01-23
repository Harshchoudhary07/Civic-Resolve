const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['upvote'],
        default: 'upvote'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can only vote once per complaint
voteSchema.index({ user: 1, complaint: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
