angular.module("messages")


    .factory("messageFactory", function ($window, $rootScope, $http, $timeout, $localStorage) {
        var self = {};
        var observerCallbacks = [];
        self.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };
        function notifyMessagesChanged() {
            observerCallbacks.forEach(function (callback) {
                callback();
            })
        }
        $rootScope.$storage = $localStorage.$default({
            messages: {}
        });
        
        self.getMessages = function() {
            return $rootScope.$storage.messages;
        };
        

        $rootScope.$watch(function() {
            return angular.toJson($rootScope.$storage.messages);
        }, function() {
            notifyMessagesChanged();
        });
        
        self.sendMessage = function (text, chatroomId, callback) {
            if (text > "") {
                $http.post("/api/messages/", {
                    body: text,
                    chatroomId: chatroomId
                }).then(function () {
                    callback(true);
                })
            } else {
                callback(false);
            }
        };

        function addMessagesToChatroom(chatroomId, newMessages) {
            if ($rootScope.$storage.messages[chatroomId] == undefined) {
                $rootScope.$storage.messages[chatroomId] = [];
            }
            newMessages.forEach(function (message) {
                var newMessageChatroomId = message.chatroomId;
                var messagesIds = $rootScope.$storage.messages[newMessageChatroomId].map(function (m) {
                    return m._id
                });
                if (messagesIds.indexOf(message._id) <= -1) {
                    $rootScope.$storage.messages[chatroomId].push(message);
                }
            });
        }

        self.fetch = function() {
            $http.get("/api/messages/query/").then(function (response) {
                var groups = angular.fromJson(response.data);
                groups.forEach(function (group) {
                    var chatroomId = group["_id"];
                    var messages = group["records"];
                    var count = group["count"];
                    if (count > 0) {
                        addMessagesToChatroom(chatroomId, messages);
                        $http.delete("/api/messages/query/");
                    }
                });
            })
        };

        self.fetch();
        // Update every second
        (function update() {
            $timeout(function () {
                self.fetch();
                update();
            }, 1000)
        })();
        return self;
    })

    .component("messages", {
        templateUrl: "app/components/messages/messages.template.html",
        controller: function ($scope, $rootScope, $element, $attrs, messageFactory, $http, userFactory) {
            var self = this;
            
            self.findUser = userFactory.findUser;
            self.getMessages = messageFactory.getMessages
            
            // Get ChatroomId by attribute
            $attrs.$observe('chatroomid', function (value) {
                self.chatroomId = value;
                console.log(value)
            });

            var messageInput = $("#input-message");
            self.send = function () {
                if (self.chatroomId != undefined) {
                    messageFactory.sendMessage(messageInput.val(), self.chatroomId, function () {
                        messageInput.val("");
                        messageFactory.fetch();
                    })
                }
            };

            function updateCurrentUserId() {
                $http.get("/api/users/current").then(function (response) {
                    var user = response.data;
                    self.currentUserId = user._id;
                });
            }
            
            self.isOwner = function(message) {
                return self.currentUserId == message.userId ? "own" : "other"
            };
            
            updateCurrentUserId();            
            return self
        }
    });
