const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['APPROVE_USER', 'BAN_USER', 'UNBAN_USER', 'ARCHIVE_COMPLAINT', 'OVERRIDE_STATUS', 'CREATE_DEPARTMENT', 'UPDATE_DEPARTMENT', 'DELETE_DEPARTMENT', 'UPDATE_SLA', 'ASSIGN_DEPARTMENT']
    },
    targetEntity: {
        type: String,
        required: true,
        enum: ['User', 'Complaint', 'Department', 'System']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Might be null for system-wide configs
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // flexible for storing reasons, old values, etc.
        default: {}
    },
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now,
        expires: '365d' // Auto-delete logs after 1 year compliance
    }
});

auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
