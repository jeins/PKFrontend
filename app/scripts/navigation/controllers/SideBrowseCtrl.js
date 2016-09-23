'use strict';

angular.module('pkfrontendApp')
    .controller('SideBrowseCtrl', SideBrowseCtrl);

SideBrowseCtrl.$inject = ['$scope', 'svcLayer', 'svcWorkspace', '$window', '$routeParams', '$log', 'svcSecurity', 'svcPkLayer', 'CONFIG'];

function SideBrowseCtrl($scope, svcLayer, svcWorkspace, $window, $routeParams, $log, svcSecurity, svcPkLayer, CONFIG) {
    var vm = this;
    vm.init = init;
    vm.changeWorkspace = changeWorkspace;
    vm.viewLayer = viewLayer;
    vm.layerSelectChange = layerSelectChange;
    vm.downloadLayer = downloadLayer;
    vm.downloadFeatureCollection = downloadFeatureCollection;

    init();

    function init(){
        vm.setWorkspaces = [];
        vm.layerGroups = [];
        vm.layers = [];
        vm.selectedLayer = [];
        vm.selectedWorkspace = '';
        vm.displayLayer = false;
        vm.layerGroupName = '';
        vm.tmpDrawTypes = [];
        vm.disabledExport = true;

        svcWorkspace.getWorkspaces(function(result){
            vm.setWorkspaces = result.data;
        });

        if($routeParams.layer != undefined){
            vm.displayLayer = true;
            var param = svcSecurity.decode($routeParams.layer); $log.info("Request URI: " + param);
            var workspace = param.split(':')[0];
            var layerGroup = param.split(':')[1];
            var layersAndDrawTypes = param.split(':')[2].split(';');
            for(var i=0; i<layersAndDrawTypes.length; i++){

                if(layersAndDrawTypes[i] == "") {
                    continue;
                }
                var layerAndDrawType = layersAndDrawTypes[i].split('?');
                var layer = layerAndDrawType[0];
                var drawType = layerAndDrawType[1];
                $log.info("Display Layer: " + layer);
                if(layer != ""){
                    vm.disabledExport = false;
                    vm.selectedLayer[drawType] = true;
                } else{
                    vm.selectedLayer[drawType] = false;
                }
                vm.tmpDrawTypes.push({drawType: layer});
                vm.layers.push({'name': layer, 'type': drawType});
            }

            vm.layerGroupName = layerGroup.replace(/_/g, ' ');
            vm.selectedWorkspace = workspace;
        }
    }

    function downloadFeatureCollection(){
        var layerNames = "";
        vm.layers.forEach(function(values){
           if(values.name != ""){
               layerNames += values.name + ',';
           }
        });
        $window.location.href = CONFIG.http.rest_host + '/layer/' + vm.selectedWorkspace + '/' + layerNames + '/bylayer/geojson';
    }

    function downloadLayer(layer, type){
        svcLayer.geoserver(function(response){
            var url = response.data + vm.selectedWorkspace +
                '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName='+ vm.selectedWorkspace + ':' + layer +
                '&maxFeatures=50&outputFormat=';

            switch (type){
                case 'shapefile':
                    url += 'SHAPE-ZIP';
                    break;
                case 'csv':
                    url += 'csv';
                    break;
                case 'geojson':
                    url += 'application%2Fjson';
                    break;
                case 'kml':
                    url += 'application%2Fvnd.google-earth.kml%2Bxml';
                    break;
            }
            $window.location.href = url;
        });
    }

    function layerSelectChange(){
        var layer = vm.layerGroupName.replace(/[ ]+/g, '_');
        vm.setType = '';
        svcLayer.getLayerAndDrawType(vm.selectedWorkspace, layer, function(response){
            var records = response.data;
            for(var i=0; i<records.length; i++){
                if(vm.selectedLayer['point'] && records[i].drawType == 'point'){
                    vm.setType += records[i].layer;
                }
                if(vm.selectedLayer['linestring'] && records[i].drawType == 'linestring'){
                    vm.setType += records[i].layer;
                }
                if(vm.selectedLayer['polygon'] && records[i].drawType == 'polygon'){
                    vm.setType += records[i].layer;
                }

                vm.setType += '?' + records[i].drawType +';';
            }
            $window.location.href = '/#/view/' + svcSecurity.encode(vm.selectedWorkspace+':'+layer+':'+vm.setType);
        });
    }

    function viewLayer(workspace, layer){
        layer = layer.replace(/[ ]+/g, '_');
        vm.setType = '';
        svcLayer.getLayerAndDrawType(workspace, layer, function(response){
            var records = response.data;
            for(var i=0; i<records.length; i++){
                vm.setType += records[i].layer + '?' + records[i].drawType +';';
            }

            $window.location.href = '/#/view/' + svcSecurity.encode(workspace+':'+layer+':'+vm.setType);
        });
    }

    function changeWorkspace(workspace){
        vm.displayLayer = false;
        vm.layerGroups = [];
        svcPkLayer.getByWorkspace(workspace, function(response){
            var records = response.data;
            $log.info('Layers From Workspace %s :', workspace);
            $log.info(records);
            for(var record in records){
                var type = '';
                vm.layerGroups.push({'name':(records[record].name).replace(/_/g, ' '), 'type': type});
            }
        });
    }
}