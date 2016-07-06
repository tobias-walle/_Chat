angular.module("chatrooms")
    .factory("chatroomFactory", function ($window, $rootScope, $http, $timeout, $localStorage, messageFactory) {
        var self = {};
        var observerCallbacks = [];
        $rootScope.$storage = $localStorage.$default({
            chatrooms: []
        });

        self.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };

        function notifyChatroomsChanged() {
            observerCallbacks.forEach(function (callback) {
                callback();
            })
        }

        function updateChatroomName(chatroom) {
            // The name of the chatroom is a list of the users
            var users = chatroom.__userObjects;
            if (users != undefined) {
                var name = chatroom.__userObjects.map(function (user) {
                    return user.name;
                }).join(", ");
                chatroom.__name = name;
            } else {
                chatroom.__name = "";
            }
        }


        function updateLatestMessage(chatroom) {
            var messages = messageFactory.getMessages()[chatroom._id];
            if (messages) {
                var message = messages[messages.length - 1];
                chatroom.__latest_message = message;
            }
        }

        function updateLatestMessageAll() {
            $rootScope.$storage.chatrooms.forEach(function (chatroom) {
                updateLatestMessage(chatroom);
            })
        }

        $rootScope.$watch(function () {
            return angular.toJson($rootScope.$storage.chatrooms);
        }, function () {
            console.log("Test");
        });


        self.fetch = function () {
            $http.get("/api/chatrooms").then(function (response) {
                var chatrooms = response.data;
                var chatroomsIds = $rootScope.$storage.chatrooms.map(function (x) {
                    return x._id
                });
                chatrooms.forEach(function (chatroom) {
                    if (chatroomsIds.indexOf(chatroom._id) <= -1) {
                        console.log("Add " + chatroom._id);
                        var requestData = {
                            userIds: chatroom.users
                        };
                        $http.post("/api/users/objects", requestData).then(function (response) {
                            chatroom.__userObjects = response.data;
                            updateChatroomName(chatroom);
                            updateLatestMessage(chatroom);
                            $rootScope.$storage.chatrooms.push(chatroom);
                        });
                    }
                    notifyChatroomsChanged();
                });
                var newChatroomIds = chatrooms.map(function (x) {
                    return x._id;
                });
                chatroomsIds.forEach(function (chatroomId) {
                    if (newChatroomIds.indexOf(chatroomId) <= -1) {
                        // Delete
                        console.log("Delete " + chatroomId);
                        $rootScope.$storage.chatrooms.splice(chatroomsIds.indexOf(chatroomId));
                        notifyChatroomsChanged();
                    }
                })

            })
        };

        self.create = function (userIds) {
            // Create a new chatroom with the selected user
            var data = {
                users: userIds
            };
            $http.post('/api/chatrooms', data).then(function () {
                self.fetch();
            });
        };

        self.getChatrooms = function () {
            return $rootScope.$storage.chatrooms;
        };

        function init() {
            self.fetch();
            // Update every 2 seconds
            (function update() {
                $timeout(function () {
                    self.fetch();
                    update();
                }, 2000)
            })();
            messageFactory.registerObserverCallback(function () {
                updateLatestMessageAll();
            })
        }

        init();
        return self;

    })
    .component("chatrooms", {
        templateUrl: "app/components/chatrooms/chatrooms.template.html",
        bindings: {
            selected: '=selectedChatroom'
        },
        controller: function chatroomController($rootScope, $http, chatroomFactory) {
            var self = this;
            self.selected = undefined;
            self.chatroomFactory = chatroomFactory;

            self.getChatrooms = chatroomFactory.getChatrooms;

            function updateSelection() {
                if (self.selected == undefined && self.getChatrooms().length > 0) {
                    self.select(self.getChatrooms()[0]);
                } else if (self.selected != undefined && self.getChatrooms().length == 0) {
                    self.selected = undefined;
                }
            }
            
            chatroomFactory.registerObserverCallback(function () {
                updateSelection();
            });

            self.inviteButtonClicked = function (usersIds) {
                chatroomFactory.create(usersIds);
                self.toggleDialog();
            };

            self.isSelected = function (chatroom) {
                return self.selected && self.selected._id == chatroom._id;
            };

            self.select = function (chatroom) {
                self.selected = chatroom;
            };
            updateSelection();
            
            self.visibleDialog = false;
            self.toggleDialog = function () {
                self.visibleDialog = !self.visibleDialog;
            };

            return self
        }
    });
    