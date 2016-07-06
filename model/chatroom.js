var mongoose = require('mongoose');

var chatroomSchema = new mongoose.Schema({
    users: {type: Array, default: []}
});
var dataModel = mongoose.model("Chatroom", chatroomSchema);

module.exports = dataModel;
