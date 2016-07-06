angular.module("popupWindow")
    .component("popupWindow", {
        templateUrl: "app/components/popup-window/popup-window.template.html",
        bindings: {
            show: '='
        },
        transclude: true,
        controller: function popupWindowController($scope, $element, $attrs) {
            var self = this;
            if (self.show == undefined) {
                self.show = false;
            }
            
            self.hideWindow = function () {
                self.show = false;
            };
            self.showWindow = function () {
                self.show = true;
            };
            self.toggleWindow = function () {
                if (self.show) {
                    self.hideWindow();
                } else {
                    self.showWindow();
                }
            };
            return self;
        }
    });