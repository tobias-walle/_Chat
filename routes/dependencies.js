var express = require("express");
var router = express.Router();
var movePathUp = require("../utils/path_utils").movePathUp;

// node-modules <-> client dependency mapping
var dependencies = [
    ["angular.min.js", "angular/angular.min.js"],
    ["angular-route.min.js", "angular-route/angular-route.min.js"],
    ["angular-animate.min.js", "angular-animate/angular-animate.min.js"],
    ["jquery.min.js", "jquery/dist/jquery.min.js"],
    ["scrollglue.js", "angularjs-scroll-glue/src/scrollglue.js"],
    ["ngStorage.min.js", "ngstorage/ngStorage.min.js"]
];

// Get root dir
var appdirname = movePathUp(__dirname);

// Set all the dependencies, which where previous defined
dependencies.forEach(function(dependency) {
    router.get("/" + dependency[0], function (req, res, next) {
        var path = appdirname + "/node_modules/" + dependency[1];
        res.sendFile(path);
    });
});


module.exports = router;