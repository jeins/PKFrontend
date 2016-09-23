'use strict';

angular.module('pkfrontendApp')
    .controller('SideEditCtrl', SideEditCtrl);

SideEditCtrl.$inject = ['$scope', 'svcWorkspace', 'svcSharedProperties', '$log', 'svcLayer'];

function SideEditCtrl($scope, svcWorkspace, svcSharedProperties, $log, svcLayer){
    var vm = this;
    vm.addAlert = addAlert;
    vm.closeAlert = closeAlert;
    vm.updateLayer = updateLayer;
    vm.selectedDrawType = selectedDrawType;
    vm.selectDrawOrModify = selectDrawOrModify;

    init();

    function init(){
        vm.drawType = '';
        vm.layerGroupName = '';
        vm.alerts = [];
        vm.disabledDrawType = false;

        $scope.$on('pk.edit.layerGroup', function(event, data){
            vm.disabledTextLayer = true;
            vm.selectedWorkspace = data.workspace;
            vm.layerGroupName = data.layerGroup;
            vm.layers = data.layers;
            vm.newLayersName = "";
            vm.layerWithDrawType = [];

            svcWorkspace.getWorkspaceWithDrawTyp(data.workspace, function(result){
                vm.setDrawTypes = result.data;
            });

            var layer = vm.layers.split(',');
            for(var i=0; i<layer.length; i++){
                if(layer[i] != ""){
                    svcLayer.getDrawType(vm.selectedWorkspace, vm.layerGroupName, layer[i], function(response){
                        vm.layerWithDrawType.push(response.data);
                    })
                }
            }
        });
    }

    function addAlert(layerGroupName){
        vm.alerts.push({type: 'success', msg: 'Layer '+layerGroupName+' telah simpan!'});
    }

    function closeAlert(index){
        vm.alerts.splice(index, 1);
    }

    function selectedDrawType(value){
        svcSharedProperties.sendBroadcast(function(v){
            $scope.$emit('pk.edit.selectedDrawType', value);
        });
    }

    function selectDrawOrModify(value){
        $log.info("Selected mode: " + value);

        vm.disabledDrawType = false;
        if(value == "modify"){
            vm.disabledDrawType = true;
        }
        svcSharedProperties.sendBroadcast(function(v){
            $scope.$emit('pk.edit.isDrawOrModify', value);
        });
    }

    function updateLayer(workspace, layerGroupName){
        var coordinates = _generateCoordinates();

        var obj = {
            "name": layerGroupName,
            "workspace": workspace,
            "layers": vm.newLayersName,
            "coordinates": coordinates
        };

        $log.info(obj);
        svcLayer.editLayer(obj, function(response){
        });
    }

    function _checkIfCreateNewDrawType(drawType){
        var isExist = false;
        vm.layerWithDrawType.forEach(function(d){
            if(d.drawType == drawType){
                isExist = true;
            }
        });
        return isExist;
    }

    function _generateCoordinates(){
        var tmpVal = svcSharedProperties.getLayerValues();
        var tmpType = {'linestring': '', 'point': '', 'polygon':''};
        var name;

        if(tmpVal.point.length > 0){
            tmpType.point =  tmpVal.point;
            if(!_checkIfCreateNewDrawType("point")){
                name = vm.layerGroupName + '_point';
                vm.layerWithDrawType.push({layer: name, drawType: 'point'});
            }
        } else {
            delete tmpType['point'];
        }

        if(tmpVal.linestring.length > 0){
            tmpType.linestring =  tmpVal.linestring;
            if(!_checkIfCreateNewDrawType("linestring")){
                name = vm.layerGroupName + '_linestring';
                vm.layerWithDrawType.push({layer: name, drawType: 'linestring'});
            }
        }else {
            delete tmpType['line'];
        }

        if(tmpVal.polygon.length > 0){
            tmpType.polygon =  tmpVal.polygon;
            if(!_checkIfCreateNewDrawType("polygon")){
                name = vm.layerGroupName + '_polygon';
                vm.layerWithDrawType.push({layer: name, drawType: 'polygon'});
            }
        }else {
            delete tmpType['poly'];
        }

        vm.layerWithDrawType.sort(_sortBy('drawType', false, function(a){return a.toLowerCase()}));
        vm.newLayersName = "";
        vm.layerWithDrawType.forEach(function(d){
            vm.newLayersName += d.layer + ",";
        });

        return tmpType;
    }

    function _sortBy(field, reverse, primer){

        var key = primer ?
            function(x) {return primer(x[field])} :
            function(x) {return x[field]};

        reverse = !reverse ? 1 : -1;

        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    }
}