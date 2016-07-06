var express = require('express');
var chatrooms = require('../api/chatrooms');
var messages = require('../api/messages');
var users = require('../api/users');
var router = express.Router();

router.use("/users", users);
router.use("/chatrooms", chatrooms);
router.use('/messages', messages);

module.exports = router;