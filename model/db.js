var mongoose = require("mongoose");
var url = "mongodb://localhost:27017/_chat";
mongoose.connect(url);

module.exports.url = url;
