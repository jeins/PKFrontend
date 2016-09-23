'use strict';

angular.module('pkfrontendApp')
  .controller('MapCtrl', MapCtrl);

MapCtrl.$inject = ['$scope', '$log', 'svcSharedProperties'];
function MapCtrl($scope, $log, svcSharedProperties) {
    var vm = this;
    vm.init = init;

    init();

    function init(){
        svcSharedProperties.tester(function(res){
            console.log(res)
        });

        vm.drawType = '';
        vm.drawValue = [];
        var point = [], line=[], poly=[];

        angular.extend($scope, {
            defaults: {
                events: {
                    map: ['pointermove']
                }
            },
            indonesia: {
                lat: -0.4055727193536711,
                lon: 116.19846321160155,
                zoom: 5
            },
            mouseposition: '',
            projection: 'EPSG:4326'
        });

        $scope.$on('pk.draw.selectedDrawType', function(event, data){
            $log.info("selected drawType: %s", data);
            vm.drawType = data;
        });

        $scope.$on('pk.draw.feature', function(event, data) {
            var feature = data;
            switch(feature.getGeometry().getType()){
                case 'Point':
                    var pointCoor = new ol.geom.Point(feature.getGeometry().getCoordinates()).transform("EPSG:3857", "EPSG:4326");
                    if(point.id != feature.getProperties().id)
                        point[feature.getProperties().id] = pointCoor.getCoordinates();
                    else point.id = data;
                    break;
                case 'LineString':
                    var lineCoor = new ol.geom.LineString(feature.getGeometry().getCoordinates()).transform("EPSG:3857", "EPSG:4326");
                    if(line.id != feature.getProperties().id)
                        line[feature.getProperties().id] = lineCoor.getCoordinates();
                    else line.id = data;
                    break;
                case 'Polygon':
                    var polyCoor = new ol.geom.Polygon(feature.getGeometry().getCoordinates()).transform("EPSG:3857", "EPSG:4326");
                    if(poly.id != feature.getProperties().id)
                        poly[feature.getProperties().id] = polyCoor.getCoordinates();
                    else poly.id = data;
                    break;
            }
            $log.info(point);$log.info(line);$log.info(poly);
            svcSharedProperties.setLayerValues({'point':point, 'linestring':line, 'polygon':poly});
        });

        $scope.$on('openlayers.map.pointermove', function(event, data){
            $scope.$apply(function(){
                if($scope.projection == data.projection){
                    vm.mouseposition = data.coord;
                } else{
                    var p = ol.proj.transform([data.coord[0], data.coord[1]], data.projection, $scope.projection);

                    vm.mouseposition = 'lat:' + p[1] + ', lon:' + p[0];
                }
            })
        });
    }
}