const User = require('../models/User');
const Debate = require('../models/Debate');
const Message = require('../models/Message');

/* createUser */
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const existing = email ? await User.findOne({ email }) : null;
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    console.error('createUser error', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/* getUser */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getUser error', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/* getUserDebates: list debates for a user with last-message preview */
exports.getUserDebates = async (req, res) => {
  try {
    const userId = req.params.id;
    const debates = await Debate.find({ "participants.user": userId })
      .populate('topic', 'name category')
      .sort({ lastUpdated: -1 })
      .lean();

    const debateIds = debates.map(d => d._id);
    if (debateIds.length === 0) return res.json([]);

    const lastMessages = await Message.aggregate([
      { $match: { debate: { $in: debateIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$debate", lastMessage: { $first: "$$ROOT" } } }
    ]);

    const lastMap = {};
    lastMessages.forEach(m => { lastMap[m._id.toString()] = m.lastMessage; });

    const result = debates.map(d => ({
      _id: d._id,
      topic: d.topic,
      participants: d.participants,
      status: d.status,
      lastUpdated: d.lastUpdated,
      lastMessage: lastMap[d._id.toString()] || null
    }));

    res.json(result);
  } catch (err) {
    console.error('getUserDebates error', err);
    res.status(500).json({ error: 'Failed to load user debates' });
  }
};
