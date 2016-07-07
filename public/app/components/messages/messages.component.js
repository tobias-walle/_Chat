angular.module("messages")


    .factory("messageFactory", function ($window, $rootScope, $http, $timeout, $localStorage) {
        var self = {};
        var observerCallbacks = [];

        $rootScope.$storage = $localStorage.$default({
            messages: {}
        });

        $rootScope.$watch(function() {
            return angular.toJson($rootScope.$storage.messages);
        }, function() {
            notifyMessagesChanged();
        });

        /**
         * Register a new Callback
         * @param callback A callback which triggers when new messages arrive
         */
        self.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };

        /**
         * Call all callbacks
         */
        function notifyMessagesChanged() {
            observerCallbacks.forEach(function (callback) {
                callback();
            })
        }

        /**
         * Get all messages from the storage
         * @returns {$rootScope.$storage.messages|{}}
         */
        self.getMessages = function() {
            return $rootScope.$storage.messages;
        };

        /**
         * Semd a mew Message
         * @param text message text
         * @param chatroomId Chatroom
         * @param callback Callback
         */
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

        /**
         * Add an array of the messages to an chatroom.
         * @param chatroomId The chatroom
         * @param newMessages The messages
         */
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

        /**
         * Fetch the messages from the server.
         */
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

        // Initial Fetch
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

            /**
             * Listen to changes of the chatroomId
             */
            $attrs.$observe('chatroomid', function (value) {
                self.chatroomId = value;
            });

            
            var messageInput = $("#input-message");
            /**
             * Send a new Message
             */
            self.send = function () {
                if (self.chatroomId != undefined) {
                    messageFactory.sendMessage(messageInput.val(), self.chatroomId, function () {
                        messageInput.val("");
                        messageFactory.fetch();
                    })
                }
            };

            // Update the current userId
            function updateCurrentUserId() {
                $http.get("/api/users/current").then(function (response) {
                    var user = response.data;
                    self.currentUserId = user._id;
                });
            }

            /**
             * Check if user is owned by the current user.
             * @param message The message object
             * @returns {string} 'own' if owner, else 'other'
             */
            self.isOwner = function(message) {
                return self.currentUserId == message.userId ? "own" : "other"
            };
            
            updateCurrentUserId();            
            return self
        }
    });
