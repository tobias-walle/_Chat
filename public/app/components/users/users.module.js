angular.module("users", ["ngStorage"])
    .filter("excludeUser", function() {
        // Filter out a specific user, based on the id.
        return function (array, user) {
            if (user != undefined && array != undefined) {
                var res = [];
                for (var i=0; i<array.length; i++) {
                    var e = array[i];
                    if (e._id != user._id) {
                        res.push(e)
                    }
                }
                return res;
            } else {
                return array;
            }
        }
    });