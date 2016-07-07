angular.
    module("chatApp").
    config(["$locationProvider", '$routeProvider',
        function config($locationProvider, $routerProvider) {
            $locationProvider.hashPrefix('!');
            
            $routerProvider.
                when('/', {
                    template: "<private-chat></private-chat>"
                }).
                otherwise('/');
        }
    ]);