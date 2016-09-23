'use strict';

angular.module('pkfrontendApp')
    .directive('olControl', olControl);

olControl.$inject = ["$q", "olData", "olMapDefaults", "olHelpers"];
function olControl($q, olData, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: {
            properties: '=olControlProperties'
        },
        replace: false,
        require: '^pkMaps',
        link: function(scope, element, attrs, controller) {
            var isDefined   = olHelpers.isDefined;
            var olScope   = controller.getOpenlayersScope();
            var olControl;
            var olControlOps;

            olScope.getMap().then(function(map) {
                var getControlClasses = olHelpers.getControlClasses;
                var controlClasses = getControlClasses();

                scope.$on('$destroy', function() {
                    map.removeControl(olControl);
                });

                if (!isDefined(scope.properties) || !isDefined(scope.properties.control)) {
                    if (attrs.name) {
                        if (isDefined(scope.properties)) {
                            olControlOps = scope.properties;
                        }
                        olControl = new controlClasses[attrs.name](olControlOps);
                        map.addControl(olControl);
                    }
                    return;
                }

                olControl = scope.properties.control;
                map.addControl(olControl);
            });
        }
    };
}