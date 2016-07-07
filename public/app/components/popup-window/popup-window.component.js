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

            /**
             * Hide the popup
             */
            self.hideWindow = function () {
                self.show = false;
            };

            /**
             * Show the popup
             */
            self.showWindow = function () {
                self.show = true;
            };

            /**
             * Toggle the popup
             */
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