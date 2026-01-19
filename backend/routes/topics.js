const express = require('express');
const authMiddleware = require('../middleware/auth');
const Topic = require('../models/Topic');

const router = express.Router();

// Get all topics for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.userId });
    res.status(200).json({ topics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single topic by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if topic belongs to user
    if (topic.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to access this topic' });
    }

    res.status(200).json({ topic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new topic
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Please provide a topic title' });
    }

    const topic = new Topic({
      title,
      description,
      userId: req.userId
    });

    await topic.save();

    res.status(201).json({
      message: 'Topic created successfully',
      topic
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update topic
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    let topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if topic belongs to user
    if (topic.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this topic' });
    }

    if (title) topic.title = title;
    if (description) topic.description = description;

    await topic.save();

    res.status(200).json({
      message: 'Topic updated successfully',
      topic
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete topic
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if topic belongs to user
    if (topic.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this topic' });
    }

    await Topic.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
