const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  debate: { type: mongoose.Schema.Types.ObjectId, ref: "Debate", required: true },
  senderType: { type: String, enum: ["user", "ai1", "ai2"], required: true },
  senderUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  text: { type: String, required: true },
  roundNumber: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);