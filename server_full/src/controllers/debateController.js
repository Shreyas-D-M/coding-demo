const Debate = require('../models/Debate');
const Message = require('../models/Message');

/* list debates */
exports.listDebates = async (req, res) => {
  try {
    const debates = await Debate.find().populate('topic','name category').sort({ lastUpdated: -1 }).lean();
    res.json(debates);
  } catch (err) {
    console.error('listDebates error', err);
    res.status(500).json({ error: 'Failed to list debates' });
  }
};

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
    const { senderUser, senderType, text, roundNumber, aiName, metadata } = req.body;
    if (!text || !senderType) return res.status(400).json({ error: 'senderType and text are required' });

    // ensure debate exists (and get participants)
    const debate = await Debate.findById(debateId).lean();
    if (!debate) return res.status(404).json({ error: 'Debate not found' });

    // create message
    const message = await Message.create({
      debate: debateId,
      senderUser: senderUser || null,
      senderType,
      aiName: aiName || null,
      text,
      metadata: metadata || {},
      roundNumber: roundNumber || 1,
      createdAt: new Date()
    });

    // update debate lastUpdated (helpful for history sorting)
    await Debate.findByIdAndUpdate(debateId, { lastUpdated: new Date() });

    // emit to socket room if io exists
    const io = req.app && req.app.get && req.app.get('io');
    if (io) {
      io.to(String(debateId)).emit('message', message);
    }

    // respond to client immediately
    res.status(201).json(message);

    // trigger AI responders asynchronously (non-blocking)
    if (senderType === 'user') {
      // call trigger function but don't await
      triggerAiResponses(debate, message, req.app).catch(err => {
        console.error('triggerAiResponses error (async)', err);
      });
    }
  } catch (err) {
    console.error('addMessage error', err);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

/**
 * triggerAiResponses(debate, userMessage, app)
 * - debate: debate document (lean) including participants
 * - userMessage: the message object just created
 * - app: express app (so we can access io and openaiService via app.get)
 *
 * For each participant in debate.participants where isAi===true:
 * - determine a role string to use as senderType (prefer participant.role)
 * - call openaiService.generateReply(...) if available, otherwise create a mock reply
 * - persist the AI message WITH senderType set to the participant.role (e.g. 'ai1' or 'ai2')
 * - emit the AI message to the socket room
 */
async function triggerAiResponses(debate, userMessage, app) {
  try {
    if (!debate || !Array.isArray(debate.participants)) return;

    // get ai participants
    const aiParticipants = debate.participants.filter(p => p && p.isAi);

    if (!aiParticipants.length) return;

    // Build simple context (last few messages) for model call if available
    const recent = await Message.find({ debate: debate._id }).sort({ createdAt: -1 }).limit(10).lean();
    const context = recent.reverse().map(m => ({ role: m.senderType === 'user' ? 'user' : 'assistant', content: m.text }));

    // openaiService (optional)
    const openaiService = app && app.get ? app.get('openaiService') : null;
    const io = app && app.get ? app.get('io') : null;

    for (const participant of aiParticipants) {
      // determine role to use as senderType (must match your Message schema enum)
      let roleType = participant.role;
      if (!roleType) {
        if (participant.aiName && participant.aiName.toLowerCase().includes('b')) roleType = 'ai2';
        else roleType = 'ai1';
      }

      // produce ai reply text (call service if available, otherwise mock)
      let aiReplyText;
      try {
        if (openaiService && typeof openaiService.generateReply === 'function') {
          aiReplyText = await openaiService.generateReply({
            debateId: String(debate._id),
            aiName: participant.aiName || roleType,
            context,
            userMessage: userMessage.text
          });
        } else {
          aiReplyText = `(Mock ${participant.aiName || roleType}) Counter-argument to: "${userMessage.text}"`;
        }
      } catch (e) {
        console.error('openaiService.generateReply error, using mock reply', e);
        aiReplyText = `(Mock ${participant.aiName || roleType}) Counter-argument to: "${userMessage.text}"`;
      }

      // create AI message (persist)
      try {
        const aiMsg = await Message.create({
          debate: debate._id,
          senderType: roleType,
          aiName: participant.aiName || null,
          text: aiReplyText,
          roundNumber: userMessage.roundNumber || 1,
          createdAt: new Date()
        });

        // update debate lastUpdated
        await Debate.findByIdAndUpdate(debate._id, { lastUpdated: new Date() });

        // emit to socket room if available
        if (io) {
          io.to(String(debate._id)).emit('message', aiMsg);
        }
      } catch (e) {
        console.error('Failed to persist/emit AI message for participant', participant, e);
      }
    }
  } catch (err) {
    console.error('triggerAiResponses top-level error', err);
  }
}

exports.triggerAiResponses = triggerAiResponses; // export for socket handler reuse (optional)

/* get messages for a debate (existing) */
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const query = { debate: id };
    if (before) query.createdAt = { $lt: before };
    const msgs = await Message.find(query).sort({ createdAt: 1 }).limit(limit).lean();
    res.json(msgs);
  } catch (err) {
    console.error('getMessages error', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
