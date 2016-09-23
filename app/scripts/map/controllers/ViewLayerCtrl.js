'use strict';

angular.module('pkfrontendApp')
    .controller('ViewLayerCtrl', ViewLayerCtrl);

ViewLayerCtrl.$inject = ['$scope', '$routeParams', 'svcSharedProperties', 'svcLayer', 'olData', 'svcSecurity'];
function ViewLayerCtrl($scope, $routeParams, svcSharedProperties, svcLayer, olData, svcSecurity) {
    var vm = this;
    vm.init = init;

    init();

    function init(){
        svcSharedProperties.setSelectedNav('browse');
        var request = _getRequestProperties(svcSecurity.decode($routeParams.layer));

        $scope.geoproperties = {
            'workspace': request.workspace,
            'layerGroup': request.layerGroup,
            'layers': request.layers
        };

        _setupMap();
        _setupMapZoom(request.workspace, request.layerGroup);
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

    function _setupMap(){
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
            layer: {},
            projection: 'EPSG:4326'
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