const Topic = require('../models/Topic');

exports.getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ name: 1 });
    res.json(topics);
  } catch (err) {
    console.error('getTopics error', err);
    res.status(500).json({ error: 'Failed to load topics' });
  }
};

exports.addTopic = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const existing = await Topic.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Topic already exists' });
    const topic = await Topic.create({ name, category });
    res.status(201).json(topic);
  } catch (err) {
    console.error('addTopic error', err);
    res.status(500).json({ error: 'Failed to add topic' });
  }
};
