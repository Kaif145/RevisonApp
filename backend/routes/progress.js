const express = require('express');
const authMiddleware = require('../middleware/auth');
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');

const router = express.Router();

// Default review intervals (days)
const DEFAULT_INTERVALS = [1, 3, 7, 21];

// Get all progress records for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId })
      .populate('topicId', 'title description');
    
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get topics due for revision (any incomplete review interval due today)
router.get('/due/topics', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueProgress = await Progress.find({
      userId: req.userId,
      'reviewIntervals.isCompleted': false,
      'reviewIntervals.scheduledDate': { $lte: new Date() }
    }).populate('topicId', 'title description');

    res.status(200).json({ dueTopics: dueProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create progress with default review intervals
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({ error: 'Please provide topicId' });
    }

    // Check if topic exists and belongs to user
    const topic = await Topic.findOne({ _id: topicId, userId: req.userId });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if progress record already exists
    let progress = await Progress.findOne({ userId: req.userId, topicId });

    if (progress) {
      return res.status(400).json({ error: 'Progress already exists for this topic' });
    }

    // Create default review intervals
    const createdDate = new Date();
    const reviewIntervals = DEFAULT_INTERVALS.map(days => {
      const scheduledDate = new Date(createdDate);
      scheduledDate.setDate(scheduledDate.getDate() + days);
      return {
        intervalDays: days,
        scheduledDate,
        isCompleted: false
      };
    });

    progress = new Progress({
      userId: req.userId,
      topicId,
      reviewIntervals
    });

    await progress.save();

    res.status(201).json({
      message: 'Progress created with default review intervals',
      progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress for a specific topic
router.get('/:topicId', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.userId,
      topicId: req.params.topicId
    }).populate('topicId', 'title description');

    if (!progress) {
      return res.status(404).json({ error: 'No progress found for this topic' });
    }

    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific review interval date
router.put('/:topicId/interval/:intervalDays', authMiddleware, async (req, res) => {
  try {
    const { scheduledDate, isCompleted } = req.body;

    let progress = await Progress.findOne({
      userId: req.userId,
      topicId: req.params.topicId
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    // Find the specific interval
    const interval = progress.reviewIntervals.find(
      i => i.intervalDays === parseInt(req.params.intervalDays)
    );

    if (!interval) {
      return res.status(404).json({ error: 'Interval not found' });
    }

    // Update the interval
    if (scheduledDate) {
      interval.scheduledDate = new Date(scheduledDate);
    }

    if (isCompleted !== undefined) {
      interval.isCompleted = isCompleted;
      if (isCompleted) {
        interval.completedDate = new Date();
      } else {
        interval.completedDate = null;
      }
    }

    progress.updatedAt = new Date();
    await progress.save();

    res.status(200).json({
      message: 'Review interval updated successfully',
      progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete progress record (delete topic from tracking)
router.delete('/:topicId', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.userId,
      topicId: req.params.topicId
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    await Progress.deleteOne({ _id: progress._id });

    res.status(200).json({ message: 'Progress record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
