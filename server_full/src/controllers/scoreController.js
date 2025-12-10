// src/controllers/scoreController.js
const Score = require('../models/Score');
const scoringService = require('../services/scoringService');

exports.createScoreForDebate = async (req, res) => {
  try {
    const debateId = req.params.id;
    const result = await scoringService.scoreDebate(debateId);

    // persist Score doc
    const saved = await Score.create({
      debate: debateId,
      breakdown: result.breakdown,
      summary: result.summary,
      meta: result.meta
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('createScoreForDebate error', err);
    res.status(500).json({ error: 'Failed to score debate', details: err.message });
  }
};

exports.getScoresForDebate = async (req, res) => {
  try {
    const debateId = req.params.id;
    const scores = await Score.find({ debate: debateId }).sort({ createdAt: -1 }).lean();
    res.json(scores);
  } catch (err) {
    console.error('getScoresForDebate error', err);
    res.status(500).json({ error: 'Failed to get scores' });
  }
};