const Debate = require('../models/Debate');
const Message = require('../models/Message');
const controller = require('../controllers/debateController'); // uses triggerAiResponses

module.exports = (io, app) => {
  // Accept either io(app) or io only; if app not provided, try to read from io._app
  if (!app && io && io._app) app = io._app;

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinDebate', ({ debateId }) => {
      if (!debateId) return socket.emit('error', { message: 'debateId required to join' });
      socket.join(debateId);
      console.log(`socket ${socket.id} joined ${debateId}`);
    });

    socket.on('leaveDebate', ({ debateId }) => {
      if (debateId) socket.leave(debateId);
    });

    // payload: { debateId, senderType, userId, text, roundNumber }
    socket.on('newMessage', async (payload) => {
      try {
        const { debateId, senderType, userId, text, roundNumber } = payload || {};
        if (!debateId || !senderType || !text) {
          return socket.emit('error', { message: 'debateId, senderType and text are required' });
        }

        // ensure debate exists and increment seq if you use seqCounter
        const debate = await Debate.findById(debateId).lean();
        if (!debate) return socket.emit('error', { message: 'Debate not found' });

        // persist incoming message (same fields as REST addMessage)
        const msgDoc = await Message.create({
          debate: debateId,
          senderType,
          senderUser: senderType === 'user' ? userId : null,
          text,
          roundNumber: roundNumber || 1,
          createdAt: new Date()
        });

        // emit to room
        io.to(debateId).emit('message', msgDoc);

        // If the sender is a user, trigger AI responses using the shared controller routine
        if (senderType === 'user') {
          // controller.triggerAiResponses expects debate (doc) and userMessage
          // ensure we pass the debate doc (lean) that includes participants
          try {
            // call async but don't await response to keep socket responsive
            controller.triggerAiResponses(debate, msgDoc, app).catch(e => {
              console.error('triggerAiResponses (socket) failed', e);
            });
          } catch (e) {
            console.error('controller.triggerAiResponses call failed', e);
          }
        }
      } catch (err) {
        console.error('socket newMessage error', err);
        socket.emit('error', { message: err.message || 'message failed' });
      }
    });
  });
};
