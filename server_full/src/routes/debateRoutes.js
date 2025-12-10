const express = require('express');
const router = express.Router();
const controller = require('../controllers/debateController');

// Debates
router.get('/', controller.listDebates);          // GET /api/debates
router.post('/', controller.createDebate);        // POST /api/debates

// Messages for a debate
router.get('/:id/messages', controller.getMessages);   // GET /api/debates/:id/messages
router.post('/:id/messages', controller.addMessage);   // POST /api/debates/:id/messages

module.exports = router;
