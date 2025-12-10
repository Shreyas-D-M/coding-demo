// src/routes/scoreRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/scoreController');

// POST /api/debates/:id/score  -> calculate + persist a score for debate
router.post('/debates/:id/score', controller.createScoreForDebate);

// GET  /api/debates/:id/score  -> list scores for debate
router.get('/debates/:id/score', controller.getScoresForDebate);

module.exports = router;