const mongoose = require('mongoose');

const reviewIntervalSchema = new mongoose.Schema({
  intervalDays: {
    type: Number,
    required: true // 1, 3, 7, 21
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date,
    default: null
  }
}, { _id: false });

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  reviewIntervals: [reviewIntervalSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', progressSchema);
