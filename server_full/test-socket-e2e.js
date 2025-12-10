const io = require('socket.io-client');
const debateId = process.env.DEBATE_ID;
const userId = process.env.USER_ID;
const socket = io('http://localhost:3000', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('connected', socket.id);
  socket.emit('joinDebate', { debateId });
  socket.emit('newMessage', { debateId, senderType: 'user', userId, text: 'Socket E2E message', roundNumber: 1 });
});

socket.on('message', (m) => console.log('message event:', m));
socket.on('error', (e) => console.error('socket error:', e));
