const Debate = require('../models/Debate');
const Message = require('../models/Message');

/* create a debate */
exports.createDebate = async (req, res) => {
  try {
    const { topic, participants } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const debate = await Debate.create({ topic, participants, status: 'active', lastUpdated: new Date() });
    res.status(201).json(debate);
  } catch (err) {
    console.error('createDebate error', err);
    res.status(500).json({ error: 'Failed to create debate' });
  }
};

/* add a message to a debate (REST) */
exports.addMessage = async (req, res) => {
  try {
    const debateId = req.params.id;
    const { senderUser, senderType, text, roundNumber } = req.body;
    if (!text || !senderType) return res.status(400).json({ error: 'senderType and text are required' });

    // optional: ensure debate exists
    const debateExists = await Debate.findById(debateId);
    if (!debateExists) return res.status(404).json({ error: 'Debate not found' });

    const message = await Message.create({
      debate: debateId,
      senderUser: senderUser || null,
      senderType,
      text,
      roundNumber: roundNumber || 1,
      createdAt: new Date()
    });

    // update debate lastUpdated (helpful for history sorting)
    await Debate.findByIdAndUpdate(debateId, { lastUpdated: new Date() });

    res.status(201).json(message);
  } catch (err) {
    console.error('addMessage error', err);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

/* get messages for a debate (existing) */
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const query = { debate: id };
    if (before) query.createdAt = { $lt: before };
    const msgs = await Message.find(query).sort({ createdAt: 1 }).limit(limit);
    res.json(msgs);
  } catch (err) {
    console.error('getMessages error', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
