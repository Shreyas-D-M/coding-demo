const Message = require('../models/Message');
const Debate = require('../models/Debate');
const aiService = require('../services/openaiService');

module.exports = function(io) {
  io.on('connection', socket => {
    console.log('🟢 Socket connected:', socket.id);

    socket.on('joinDebate', ({ debateId }) => socket.join(`debate:${debateId}`));
    socket.on('leaveDebate', ({ debateId }) => socket.leave(`debate:${debateId}`));

    socket.on('newMessage', async payload => {
      try {
        const { debateId, senderType, userId, text, roundNumber } = payload;

        const msg = await Message.create({
          debate: debateId,
          senderUser: userId || null,
          senderType,
          text,
          roundNumber
        });

        await Debate.findByIdAndUpdate(debateId, { lastUpdated: new Date() });
        io.to(`debate:${debateId}`).emit('message', msg);

        if (senderType === 'user') {
          const aiText = await aiService.getReply(text, { debateId, roundNumber });
          const aiMsg = await Message.create({
            debate: debateId, senderType: 'ai', text: aiText, roundNumber
          });
          io.to(`debate:${debateId}`).emit('message', aiMsg);
        }

      } catch (err) {
        console.error('Socket error', err);
        socket.emit('error', { message: err.message });
      }
    });
  });
};
