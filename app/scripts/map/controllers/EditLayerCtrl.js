'use strict';

angular.module('pkfrontendApp')
    .controller('EditLayerCtrl', EditLayerCtrl);

EditLayerCtrl.$inject = ['$scope', '$routeParams', 'svcSharedProperties', 'svcLayer', 'olData', 'svcSecurity', '$log'];
function EditLayerCtrl($scope, $routeParams, svcSharedProperties, svcLayer, olData, svcSecurity, $log){
    var vm = this;
    vm.init = init;

    init();

    function init(){
        vm.drawType = '';
        vm.drawValue = [];
        vm.isDrawOrModify = 'draw';
        vm.geoproperties = '';
        var point = [], line=[], poly=[];
        var request = _getRequestProperties(svcSecurity.decode($routeParams.layer));

        $scope.geoproperties = {
            'workspace': request.workspace,
            'layerGroup': request.layerGroup,
            'layers': request.layers
        };

        _setupMap();
        _setupMapZoom(request.workspace, request.layerGroup);

        svcSharedProperties.sendBroadcast(function(r){
            $scope.$broadcast('pk.edit.layerGroup', $scope.geoproperties);
        });

        $scope.$on('pk.edit.selectedDrawType', function(event, data){
            vm.drawType = data;
        });

        $scope.$on('pk.edit.isDrawOrModify', function(event, data){
            vm.isDrawOrModify = data;
        });

        $scope.$on('pk.draw.feature', function(event, data) {
            var feature = data;
            switch(feature.getGeometry().getType()){
                case 'Point':
                    var pointCoor = new ol.geom.Point(feature.getGeometry().getCoordinates()).transform("EPSG:3857", "EPSG:4326");
                    $log.debug(pointCoor.getCoordinates());
                    if(point.id != feature.getProperties().id)
                        point[feature.getProperties().id] = pointCoor.getCoordinates();
                    else point.id = data;
                    $log.info("Add Point: " + point.id);
                    break;
                case 'LineString':
                    var lineCoor = new ol.geom.LineString(feature.getGeometry().getCoordinates()).transform("EPSG:3857", "EPSG:4326");
                    $log.debug(lineCoor.getCoordinates());
                    if(line.id != feature.getProperties().id)
                        line[feature.getProperties().id] = lineCoor.getCoordinates();
                    else line.id = data;
                    $log.info("Add LineString: " + line.id);
                    break;
                case 'Polygon':
                    var polyCoor = new ol.geom.Polygon(feature.getGeometry().getCoordinates()).transform("EPSG:3857", "EPSG:4326");
                    $log.debug(polyCoor.getCoordinates());
                    if(poly.id != feature.getProperties().id)
                        poly[feature.getProperties().id] = polyCoor.getCoordinates();
                    else poly.id = data;
                    $log.info("Add Polygon: " + poly.id);
                    break;
            }
            svcSharedProperties.setLayerValues({'point':point, 'linestring':line, 'polygon':poly});
        });
    }

    function _setupMap()
    {
        angular.extend($scope, {
            defaults: {
                events: {
                    map: ['pointermove']
                }
            },
            indonesia: {
                lat: 0,
                lon: 0,
                zoom: 2
            },
            mouseposition: '',
            layer: {},
            projection: 'EPSG:4326'
        });
    }

    function _setupMapZoom(workspace, layerGroup){
        svcLayer.getBbox(workspace, layerGroup, function(response){
            var records = response.data;
            for(var i=0; i<records.length; i++){
                records[i] = parseFloat(records[i]);
            }
            olData.getMap().then(function(map) {
                var view = map.getView();
                var extent = records;
                extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
                view.fit(extent, map.getSize(), {nearest: true});
            });
        });
    }

    function _getRequestProperties(params){
        var request = {};
        request.workspace = params.split(':')[0];
        request.layerGroup = params.split(':')[1];
        var layerAndDrawType = params.split(':')[2].split(';');
        request.layers = '';
        for(var i=0; i<layerAndDrawType.length; i++){
            var layer = layerAndDrawType[i].split('?')[0];
            if(layer != ""){
                request.layers += layer + ',';
            }
        }
        return request;
    }
}