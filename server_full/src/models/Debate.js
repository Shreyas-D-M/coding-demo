const mongoose = require('mongoose');
const DebateSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stance: String,
    isAi: { type: Boolean, default: false }
  }],
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Debate', DebateSchema);
