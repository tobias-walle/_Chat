angular.module('users')
    .factory("userFactory", function ($rootScope, $localStorage, $http, $timeout) {
        var self = {};
        var observerCallbacks = [];
        
        // Initialize the local storage
        $rootScope.$storage = $localStorage.$default({
            users: []
        });
        
        // Get the current user
        $http.get("/api/users/current").then(function (reponse) {
            $rootScope.currentUser = reponse.data;
        });

        /**
         * Register a callback, which fires when the user changes.
         * @param callback Callback function
         */
        self.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };


        /**
         * Find a user with an specific id in the local storage.
         * @param userId The userId to find
         * @returns {*} The user object
         */
        self.findUser = function (userId) {
            return $.grep($rootScope.$storage.users, function (e) {
                return e._id === userId;
            })[0];
        };

        /**
         * Returns the current user
         * @returns {*} User object
         */
        self.getCurrentUser = function () {
            return $rootScope.currentUser;
        };

        /**
         * Download users from the server.
         */
        self.fetch = function () {
            $http.get('/api/users').then(function (response) {
                var newUsers = response.data;
                var oldUsers = $rootScope.$storage.users;

                var oldUserIds = [];
                for (var i = 0; i < oldUsers.length; i++) {
                    oldUserIds.push(oldUsers[i]._id);
                }

                newUsers.forEach(function (newUser) {
                    // Add user to localStorage, if he is not already in array
                    if (oldUserIds.indexOf(newUser._id) == -1) {
                        console.log("Add " + newUser._id);
                        $rootScope.$storage.users.push(newUser);
                    }
                });
            });
        };

        // Init Fetch
        self.fetch();
        // Update users all 3 seconds
        (function update() {
            $timeout(function () {
                self.fetch();
                update();
            }, 3000)
        })();

        return self;
    })
    .component('users', {
        templateUrl: 'app/components/users/users.template.html',
        bindings: {
            selected: "=usersSelected"
        },
        controller: function UsersController($rootScope, $http, userFactory) {
            var self = this;
            // Order the users on their names
            self.orderProp = 'name';
            self.currentUser = userFactory.getCurrentUser();

            // Array of selected user ids
            self.selected = [];
            
            /**
             * Select a specific user. A selected user will be highlighted and can be accessed from the outer scope
             * @param user The userobject to select.
             */
            self.select = function (user) {
                self.selected.push(user._id);
            };

            /**
             * Check if an specific user is selected.
             * @param user The user which will be checked.
             * @returns {boolean} Is selected.
             */
            self.isSelected = function (user) {
                return self.selected.indexOf(user._id) > -1;
            };

            /**
             * Unselect a specific user.
             * @param user The user which should be unselected.
             */
            self.unselect = function (user) {
                for (var i = self.selected.length - 1; i >= 0; i--) {
                    if (self.selected[i] == user._id) {
                        self.selected.splice(i, 1);
                    }
                }
            };

            /**
             * Unselect all users
             */
            self.unselectAll = function () {
                self.selected = [];
            };


            /**
             * Listen to an event, so other controllers can unselect the users.
             */
            $rootScope.$on("unselectAllUsers", function() {
                self.unselectAll();
            });
            
            /**
             * Toogle between selected and unselected.
             * @param user The user to select/unselect
             */
            self.toggleSelect = function (user) {
                if (self.isSelected(user)) {
                    self.unselect(user);
                } else {
                    self.select(user);
                }
            }
        }
    });