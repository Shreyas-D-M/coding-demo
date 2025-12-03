const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');

router.post('/', controller.createUser);
router.get('/:id', controller.getUser);
router.get('/:id/debates', controller.getUserDebates);

module.exports = router;
