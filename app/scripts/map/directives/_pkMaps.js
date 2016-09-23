'use strict';

angular.module('pkfrontendApp')
    .directive('pkMaps', pkMaps);

pkMaps.$inject = ["$q", "$compile", "olHelpers", "olMapDefaults", "olData", 'CONFIG', '$log'];
function pkMaps($q, $compile, olHelpers, olMapDefaults, olData, CONFIG, $log) {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            center: '=olCenter',
            defaults: '=olDefaults',
            view: '=olView',
            events: '=olEvents',
            drawtype: '=olDrawType',
            layerMode: '=olLayerMode',
            properties: '=olProperties'
        },
        template: '<div class="angular-openlayers-map" ng-transclude></div>',
        controller: ["$scope", function ($scope) {
            var _map = $q.defer();
            $scope.getMap = function () {
                return _map.promise;
            };

            $scope.setMap = function (map) {
                _map.resolve(map);
            };

            this.getOpenlayersScope = function () {
                return $scope;
            };
        }],
        link: function (scope, element, attrs) {
            var isDefined = olHelpers.isDefined;
            var createLayer = olHelpers.createLayer;
            var setMapEvents = olHelpers.setMapEvents;
            var setViewEvents = olHelpers.setViewEvents;
            var createView = olHelpers.createView;
            var createVectorLayerForDraw = olHelpers.createVectorLayerForDraw;
            var addDrawInteraction = olHelpers.addDrawInteraction;
            var addDrawModifyInteraction = olHelpers.addDrawModifyInteraction;
            var defaults = olMapDefaults.setDefaults(scope);

            // Set width and height if they are defined
            if (isDefined(attrs.width)) {
                if (isNaN(attrs.width)) {
                    element.css('width', attrs.width);
                } else {
                    element.css('width', attrs.width + 'px');
                }
            }

            if (isDefined(attrs.height)) {
                if (isNaN(attrs.height)) {
                    element.css('height', attrs.height);
                } else {
                    element.css('height', attrs.height + 'px');
                }
            }

            if (isDefined(attrs.lat)) {
                defaults.center.lat = parseFloat(attrs.lat);
            }

            if (isDefined(attrs.lon)) {
                defaults.center.lon = parseFloat(attrs.lon);
            }

            if (isDefined(attrs.zoom)) {
                defaults.center.zoom = parseFloat(attrs.zoom);
            }

            var controls = ol.control.defaults(defaults.controls);
            var view = createView(defaults.view);
            var features = new ol.Collection();
            var source = new ol.source.Vector({features: features});
            var setMapFromGeoJson = false;

            if(scope.properties){
                source = new ol.source.Vector({
                    'url': CONFIG.http.rest_host + '/layer/' + scope.properties.workspace +'/'+ scope.properties.layers +'/bylayer/geojson',
                    format: new ol.format.GeoJSON()
                });
                setMapFromGeoJson = true;
            }


            // Create the Openlayers Map Object with the options
            var map = new ol.Map({
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                ],
                renderer: defaults.renderer,
                target: element[0],
                view: view
            });

            var layer = createVectorLayerForDraw(source);
            map.addLayer(layer);
            map.set('default', true);

            if (!isDefined(attrs.olCenter)) {
                var c = ol.proj.transform([defaults.center.lon,
                        defaults.center.lat
                    ],
                    defaults.center.projection, view.getProjection()
                );
                view.setCenter(c);
                view.setZoom(defaults.center.zoom);
            }

            var draw;
            var ipo = 0, ils = 0, ipl = 0;
            var select = new ol.interaction.Select();
            var modify = new ol.interaction.Modify({features: select.getFeatures()});

            attrs.$observe('olLayerMode', function (value) {
                map.removeInteraction(draw);
                if (value == "'modify'") {
                    select.setActive(true);
                    modify.setActive(true);
                    var selectedFeatures = select.getFeatures();

                    map.addInteraction(select);
                    map.addInteraction(modify);
                    select.on('change:active', function () {
                        selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
                    });
                } else {
                    attrs.$observe('olDrawType', function (value) {
                        map.removeInteraction(draw);
                        select.setActive(false);
                        modify.setActive(false);
                        value = value.replace("{0}", value).replace(/\'/g, '');

                        if (value != "") {
                            draw = addDrawInteraction(source, value, features);
                            map.addInteraction(draw);
                            map.addInteraction(addDrawModifyInteraction(features));
                            setMapFromGeoJson = false;

                            draw.on('drawend', function (e) {
                                var drawType = e.feature.getGeometry().getType();
                                switch (drawType) {
                                    case 'Point':
                                        e.feature.setProperties({'id': ipo});
                                        ipo++;
                                        break;
                                    case 'LineString':
                                        e.feature.setProperties({'id': ils});
                                        ils++;
                                        break;
                                    case 'Polygon':
                                        e.feature.setProperties({'id': ipl});
                                        ipl++;
                                        break;
                                }
                                $log.info("draw feature");
                            });
                        }
                    });
                }
            });

            source.on('addfeature', function(e){
                if(setMapFromGeoJson){
                    var drawType = e.feature.getGeometry().getType();
                    switch (drawType) {
                        case 'Point':
                            e.feature.setProperties({'id': ipo});
                            ipo++;
                            break;
                        case 'LineString':
                            e.feature.setProperties({'id': ils});
                            ils++;
                            break;
                        case 'Polygon':
                            e.feature.setProperties({'id': ipl});
                            ipl++;
                            break;
                    }
                }
                scope.$emit('pk.draw.feature', e.feature);
            });

            source.on('changefeature', function (e) {
                $log.info("change feature");
                scope.$emit('pk.draw.feature', e.feature);
            });

            // Set the Default events for the map
            setMapEvents(defaults.events, map, scope);

            //Set the Default events for the map view
            setViewEvents(defaults.events, map, scope);

            // Resolve the map object to the promises
            scope.setMap(map);
            olData.setMap(map, attrs.id);
        }
    };
}