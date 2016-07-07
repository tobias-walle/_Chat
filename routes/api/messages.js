var express = require('express');
var message = require('../../model/message');
var chatroom = require('../../model/chatroom');
var user = require('../../model/user');
var dbHelper = require('../../model/db-helper');
var router = express.Router();

router.route("/")
    
    // Create a new message
    .post(function(req, res, next) {
        var body = req.body.body;
        var userId = req.session.userId;
        var chatroomId = req.body.chatroomId;
        dbHelper.createAndSendToUsers(userId, chatroomId, body, function (err, item) {
            if (err) {
                next(err);
            } else {
                console.log("POST create message " + item._id);
                res.json(item);
            }
        });
    });


router.route("/query")

    // Get messages that are not yet downloaded
    .get(function(req, res, next) {
        var userId = req.session.userId;
        dbHelper.getMessageQueryGroupedByChatroom(userId, function (err, items) {
            if (err) {
                next(err);
            } else {
                res.json(items)
            }
        })
    })

    .delete(function(req, res, next) {
        var userId = req.session.userId;
        dbHelper.deleteMessageQuery(userId, function(err, numberRemoved) {
            if (err) {
                next(err);
            } else {
                var data = {
                    count: numberRemoved
                };
                res.json(data);
            }
        });
        
    });

router.route("/chatroom/:chatroomId")

    // Get from a specific chatroom
    .get(function (req, res, next) {
        var option = req.query.option;
        var userId = req.session.userId;
        var chatroomId = req.params.chatroomId;
        // First get the chatroom, to check if the current user is a member
        chatroom.findOne({
            _id: chatroomId,
            users: { $in: [userId] }
        }, function(err, chatroomItem) {
            if (err) {
                next(err);
            }
            else if (chatroomItem == undefined) {
                next(new Error("Chatroom " + chatroomId + " does not exists."));
            } else {
                function answer(err, messages) {
                    if (err) {
                        next(err);
                    } else {
                        res.json(messages);
                    }
                }
                var criteria = { chatroomId: chatroomItem._id };
                if (option == "latest") {
                    // Get just the latest message
                    message.findOne(criteria, {}, {
                        sort: {created: -1}
                    }, answer)
                } else if (option == "until") {
                    var until = req.query.until;
                    message.find({
                        chatroomId: chatroomItem._id,
                        created: { $gt: until }
                    }, answer)
                } else {
                    // Get all messages
                    message.find(criteria, answer);
                }
            }
        });
    });



module.exports = router;
