const express = require('express');
const router = express.Router();
const controller = require('../controllers/debateController');

// create debate
router.post('/', controller.createDebate);

// messages for a debate
// POST /api/debates/:id/messages  -> create message
// GET  /api/debates/:id/messages  -> list messages
router.post('/:id/messages', controller.addMessage);
router.get('/:id/messages', controller.getMessages);

module.exports = router;
