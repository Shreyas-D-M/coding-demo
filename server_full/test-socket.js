const io = require('socket.io-client');
const debateId = process.env.DEBATE_ID || '<DEBATE_ID>';
const userId = process.env.USER_ID || '<USER_ID>';
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('connected', socket.id, 'debateId=', debateId, 'userId=', userId);
  socket.emit('joinDebate', { debateId });

  socket.emit('newMessage', { debateId, senderType: 'user', userId, text: 'AI should be regulated', roundNumber: 1 });

  socket.on('message', (msg) => console.log('message event:', msg));
  socket.on('error', (e) => console.error('socket error:', e));
});
