const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  stance: String,
  role: { type: String, enum: ["user", "ai1", "ai2"], required: true },
  isAi: Boolean
});

const DebateSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  participants: [ParticipantSchema],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Debate", DebateSchema);