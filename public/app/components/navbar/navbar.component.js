angular.module('navbar').component('navbar', {
    templateUrl: 'app/components/navbar/navbar.template.html',
    controller: function navbarController($location) {
        var self = this;

        self.appName = "_Chat";
        self.links = [
            {name: "private", href: "/private"},
            {name: "public", href: "/public"}
        ];
        self.isActive = function (viewLocation) {
            return viewLocation == $location.path();
        };

        return self;
    }
});