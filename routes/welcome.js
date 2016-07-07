var express = require('express');
var router = express.Router();

router.get("/", function (req, res, next) {
    var context = req.query.context;
    var note = "";
    if (context == "empty") {
        // Show an error
        note = "The username cannot be empty.";
    }
    res.render('welcome', {note: note});
});


module.exports = router;
