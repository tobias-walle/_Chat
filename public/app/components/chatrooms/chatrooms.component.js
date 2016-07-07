angular.module("chatrooms")
    .factory("chatroomFactory", function ($window, $rootScope, $http, $timeout, $localStorage, messageFactory, userFactory) {
        var self = {};
        var observerCallbacks = [];
        $rootScope.$storage = $localStorage.$default({
            chatrooms: []
        });

        /**
         * Register a new callback
         * @param callback
         */
        self.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };


        /**
         * Call all the callbacks
         */
        function notifyChatroomsChanged() {
            observerCallbacks.forEach(function (callback) {
                callback();
            })
        }

        /**
         * Generate a new chatroom name
         * @param chatroom The chatroom
         */
        function updateChatroomName(chatroom) {
            // The name of the chatroom is a list of the users
            var users = chatroom.__userObjects;
            if (users != undefined) {
                var other_users = [];
                var current_user = userFactory.getCurrentUser();
                users.forEach(function (user) {
                    if (user._id != current_user._id) {
                        other_users.push(user);
                    }
                });

                chatroom.__name = other_users.map(function (user) {
                    return user.name;
                }).join(", ");
            } else {
                chatroom.__name = "";
            }
        }


        /**
         * Update the latest message of an chatroom.
         * @param chatroom The chatroom
         */
        function updateLatestMessage(chatroom) {
            var messages = messageFactory.getMessages()[chatroom._id];
            if (messages) {
                chatroom.__latest_message = messages[messages.length - 1];
            }
        }

        /**
         * Update the latest message of all chatrooms.
         */
        function updateLatestMessageAll() {
            $rootScope.$storage.chatrooms.forEach(function (chatroom) {
                updateLatestMessage(chatroom);
            })
        }

        /**
         * Fetch and prepare chatrooms from server
         */
        self.fetch = function () {
            $http.get("/api/chatrooms").then(function (response) {
                var chatrooms = response.data;
                var chatroomsIds = $rootScope.$storage.chatrooms.map(function (x) {
                    return x._id
                });
                chatrooms.forEach(function (chatroom) {
                    if (chatroomsIds.indexOf(chatroom._id) <= -1) {
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
                        $rootScope.$storage.chatrooms.splice(chatroomsIds.indexOf(chatroomId));
                        notifyChatroomsChanged();
                    }
                })

            })
        };

        /**
         * Create a new chatroom.
         * @param userIds The members of this chatroom.
         */
        self.create = function (userIds) {
            // Create a new chatroom with the selected user
            var data = {
                users: userIds
            };
            $rootScope.$emit("unselectAllUsers");  // Emit an event to unselect all users
            $http.post('/api/chatrooms', data).then(function () {
                self.fetch();
            });
        };

        /**
         * Get all Chatrooms from the local storage
         * @returns {Array} An array of chatroom objects
         */
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

            /**
             * Update latest message on any message change
             */
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

            /**
             * Set the selection if nothing is selected
             */
            function updateSelection() {
                if (self.selected == undefined && self.getChatrooms().length > 0) {
                    self.select(self.getChatrooms()[0]);
                } else if (self.selected != undefined && self.getChatrooms().length == 0) {
                    self.selected = undefined;
                }
            }

            /**
             * Update selection if an chatroom was added or removed
             */
            chatroomFactory.registerObserverCallback(function () {
                updateSelection();
            });

            self.inviteButtonClicked = function (usersIds) {
                chatroomFactory.create(usersIds);
                self.toggleDialog();
            };

            /**
             * Check if an chatroom is selected
             * @param chatroom The chatroom to check
             * @returns {*|boolean} Is selected
             */
            self.isSelected = function (chatroom) {
                return self.selected && self.selected._id == chatroom._id;
            };

            /**
             * Select a chatroom
             * @param chatroom
             */
            self.select = function (chatroom) {
                self.selected = chatroom;
            };
            
            function init() {
                updateSelection();
                self.visibleDialog = false;
                self.toggleDialog = function () {
                    self.visibleDialog = !self.visibleDialog;
                };
            }

            init();
            return self
        }
    });
    