const mongoose = require('mongoose');
const ScoreSchema = new mongoose.Schema({
  debate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate' },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roundNumber: Number,
  relevance: Number, strength: Number, engagement: Number, total: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Score', ScoreSchema);
