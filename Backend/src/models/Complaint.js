const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remark: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Official assigned to this complaint
  },
  currentStatus: {
    type: String,
    enum: ['SUBMITTED', 'Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'],
    default: 'SUBMITTED',
    index: true
  },
  location: {
    sourceType: {
      type: String,
      required: true,
      enum: ['GPS', 'MANUAL']
    },
    address: {
      type: String,
      required: true
    },
    // GeoJSON Point for geospatial queries
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  statusHistory: [statusHistorySchema],
  attachments: [{
    url: { type: String, required: true },
    mediaType: { type: String, required: true, enum: ['image', 'video'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  remarks: [{
    official: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for dashboard performance
complaintSchema.index({ user: 1, currentStatus: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);