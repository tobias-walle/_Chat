var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;
var messageSchema = new mongoose.Schema({
    body: String,
    userId: ObjectId,
    chatroomId: ObjectId,
    created: {type: Date, default: Date.now()}
});
var dataModel = mongoose.model("Message", messageSchema);

module.exports = dataModel;
