var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    messageQuery: { type: Array, default: [] }
});
var dataModel = mongoose.model("User", userSchema);

module.exports = dataModel;
