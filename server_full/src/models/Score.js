// src/models/Score.js
const mongoose = require('mongoose');

const ParticipantScoreSchema = new mongoose.Schema({
  participantRole: { type: String, required: true }, // 'user' | 'ai1' | 'ai2' or userId
  relevance: { type: Number, default: 0 }, // 0-35
  strength: { type: Number, default: 0 },  // 0-40
  engagement: { type: Number, default: 0 },// 0-25
  total: { type: Number, default: 0 }      // sum
}, { _id: false });

const ScoreSchema = new mongoose.Schema({
  debate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  breakdown: [ParticipantScoreSchema], // scores for each participant
  summary: {                                 // optional aggregate fields
    avgRelevance: Number,
    avgStrength: Number,
    avgEngagement: Number,
    avgTotal: Number
  },
  meta: { type: Object, default: {} } // store scoring parameters, version, etc.
}, { versionKey: false });

module.exports = mongoose.model('Score', ScoreSchema);