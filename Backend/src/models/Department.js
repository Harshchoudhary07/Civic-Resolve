const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: String,
    headOfDepartment: {
        type: String, // Ideally User ID, but maybe just a name for now
        default: null
    },
    slaHours: {
        type: Number,
        default: 48,
        min: 1
    },
    escalationThresholdHours: {
        type: Number,
        default: 72
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
