var express = require('express');
var chatroom = require('../../model/chatroom.js');
var dbHelper = require('../../model/db-helper');
var router = express.Router();

router.route("/")

    // Get the all chatroooms of the current user
    .get(function (req, res, next) {
        var userId = req.session.userId;
        dbHelper.getAllChatroomsofUser(userId,
            function (err, items) {
                if (err) {
                    next(err);
                } else {
                    console.log("GET chatrooms from " + userId);
                    res.json(items);
                }
            })
    })

    // Create a new chatroom
    .post(function (req, res, next) {
        
        var users = req.body.users;
        if (users == undefined) {
            users = []
        }
        var currentUserId = req.session.userId;
        if (users.indexOf(currentUserId) <= -1) {
            // Add current User to the chatroom
            users.push(currentUserId);
        }
        chatroom.create({ users: users },
            function (err, item) {
                if (err) {
                    next(err);
                } else {
                    console.log("POST create chatroom " +  item._id);
                    res.json(item);
                }
            })
    })

    // Delete a specific chatroom
    .delete(function(req, res, next) {
        var chatroomId = req.body.chatroomId;
        chatroom.findByIdAndRemove(chatroomId, function(err, removed) {
            if (err) {
                console.error(err.stack);
                next(err);
            } else {
                console.log("DELETE chatroom " + chatroomId);
                res.json(removed);
            }
        })
    });


module.exports = router;