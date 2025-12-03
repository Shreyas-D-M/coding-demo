const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  debate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', index: true, required: true },
  senderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderType: { type: String, enum: ['user','ai','system'], required: true },
  text: { type: String, required: true },
  roundNumber: Number,
  createdAt: { type: Date, default: Date.now }
});
MessageSchema.index({ debate: 1, createdAt: -1 });
MessageSchema.index({ text: 'text' });
module.exports = mongoose.model('Message', MessageSchema);
