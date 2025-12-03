require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const debateRoutes = require('./routes/debateRoutes');
const topicRoutes = require('./routes/topicRoutes');
const userRoutes = require('./routes/userRoutes');
const socketHandler = require('./socket/socketHandler');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

connectDB().catch(err => { console.error(err); process.exit(1); });

// REST routes
app.use('/api/debates', debateRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/users', userRoutes);
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Socket.io handlers
socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
