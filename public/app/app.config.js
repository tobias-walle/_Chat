angular.
    module("chatApp").
    config(["$locationProvider", '$routeProvider',
        function config($locationProvider, $routerProvider) {
            $locationProvider.hashPrefix('!');
            
            $routerProvider.
                when('/private', {
                    template: "<private-chat></private-chat>"
                }).
                otherwise('/private');
        }
    ]);