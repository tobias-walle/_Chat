angular.module("privateChat").component("privateChat", {
    templateUrl: 'app/components/private-chat/private-chat.template.html',
    controller: function privateChatController($scope) {
        var self = this;
        $scope.chatrooms = {};
        return self;
    }
});
