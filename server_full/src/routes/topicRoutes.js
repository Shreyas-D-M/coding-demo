const express = require('express');
const router = express.Router();
const controller = require('../controllers/topicController');

router.get('/', controller.getTopics);
router.post('/', controller.addTopic);

module.exports = router;
