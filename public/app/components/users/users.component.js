angular.module('users')
    .factory("userFactory", function ($rootScope, $localStorage, $http, $timeout) {
        var self = {};
        var observerCallbacks = [];
        self.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };

        $rootScope.$storage = $localStorage.$default({
            users: []
        });


        $http.get("/api/users/current").then(function (reponse) {
            $rootScope.currentUser = reponse.data;
        });

        self.findUser = function (userId) {
            return $.grep($rootScope.$storage.users, function (e) {
                return e._id === userId;
            })[0];
        };

        self.getCurrentUser = function () {
            return $rootScope.currentUser;
        };

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
        controller: function UsersController($http, userFactory) {
            var self = this;
            self.orderProp = 'name';
            self.currentUser = userFactory.getCurrentUser();

            self.selected = [];
            self.select = function (user) {
                self.selected.push(user._id);
            };
            self.isSelected = function (user) {
                return self.selected.indexOf(user._id) > -1;
            };
            self.unselect = function (user) {
                for (var i = self.selected.length - 1; i >= 0; i--) {
                    if (self.selected[i] == user._id) {
                        self.selected.splice(i, 1);
                    }
                }
            };
            self.toggleSelect = function (user) {
                if (self.isSelected(user)) {
                    self.unselect(user);
                } else {
                    self.select(user);
                }
            }
        }
    });