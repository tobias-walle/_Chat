angular.module('navbar').component('navbar', {
    templateUrl: 'app/components/navbar/navbar.template.html',
    controller: function navbarController($location) {
        var self = this;

        self.appName = "_Chat";
        // No Public chat currently no implemented
        self.links = [
            // {name: "private", href: "/private"},
            // {name: "public", href: "/public"}
        ];

        /**
         * Check if a specific navigation element is currently active
         * @param viewLocation ViewLocation
         * @returns {boolean} Is active
         */
        self.isActive = function (viewLocation) {
            return viewLocation == $location.path();
        };

        return self;
    }
});