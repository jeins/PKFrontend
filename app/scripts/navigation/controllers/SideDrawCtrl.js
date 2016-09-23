'use strict';

angular.module('pkfrontendApp')
    .controller('SideDrawCtrl', SideDrawCtrl);

SideDrawCtrl.$inject = ['$scope', '$log', 'svcWorkspace', 'svcSharedProperties', 'svcLayer', '$window', 'svcSecurity', 'svcPkLayer'];

function SideDrawCtrl($scope, $log, svcWorkspace, svcSharedProperties, svcLayer, $window, svcSecurity, svcPkLayer){
    var vm = this;
    vm.addAlert = addAlert;
    vm.closeAlert = closeAlert;
    vm.changeWorkspace = changeWorkspace;
    vm.saveLayer = saveLayer;
    vm.isDisabled = isDisabled;
    vm.selectedDrawType = selectedDrawType;

    init();

    function init(){
        var point = [], line=[], poly=[];
        vm.loading = false;
        vm.setDrawTypes = [];
        vm.setWorkspaces = [];
        vm.layerGroupName = '';
        vm.alerts = [];

        svcWorkspace.getWorkspaces(function(result){
            vm.setWorkspaces = result.data;
        });

        $scope.$on('pk.draw.feature', function(event, data){
            var feature = data;
            switch(feature.getGeometry().getType()){
                case 'Point':
                    if(point.id != feature.getProperties().id){
                        point[feature.getProperties().id] = feature.getGeometry().getCoordinates();
                    }
                    else {
                        point.id = data;
                    }
                    break;
                case 'LineString':
                    if(line.id != feature.getProperties().id){
                        line[feature.getProperties().id] = feature.getGeometry().getCoordinates();
                    }
                    else {
                        line.id = data;
                    }
                    break;
                case 'Polygon':
                    if(poly.id != feature.getProperties().id){
                        poly[feature.getProperties().id] = feature.getGeometry().getCoordinates();
                    }
                    else {
                        poly.id = data;
                    }
                    break;
            }
        });
    }

    function selectedDrawType(value){
        svcSharedProperties.sendBroadcast(function(v){
            $scope.$emit('pk.draw.selectedDrawType', value);
        });
    }

    function isDisabled(text){
        if(text == "" || svcSharedProperties.getLayerValues() == undefined){
            return true;
        }
        return false;
    }

    function addAlert(layerGroupName){
        vm.alerts.push({type: 'success', msg: 'Layer '+layerGroupName+' telah dibuat!'});
    }

    function closeAlert(index){
        vm.alerts.splice(index, 1);
    }

    function changeWorkspace(workspace){
        $log.info("selected workspace: %s", workspace);
        svcWorkspace.getWorkspaceWithDrawTyp(workspace, function(result){
            vm.setDrawTypes = result.data;
        });
    }

    function saveLayer(workspace, layerGroupName){
        vm.loading = true;
        var tmpVal = svcSharedProperties.getLayerValues();
        $log.info(tmpVal);
        var tmpType = {'point': '', 'linestring': '', 'polygon':''};

        if(tmpVal.point.length > 0){
            tmpType.point =  tmpVal.point;
        } else {
            delete tmpType['point'];
        }
        if(tmpVal.linestring.length > 0){
            tmpType.linestring =  tmpVal.linestring;
        }else {
            delete tmpType['linestring'];
        }
        if(tmpVal.polygon.length > 0){
            tmpType.polygon =  tmpVal.polygon;
        }else {
            delete tmpType['polygon'];
        }

        var obj = {
            "name": layerGroupName,
            "workspace": workspace,
            "type": tmpType
        };

        svcPkLayer.addUserLayer({name: layerGroupName, description: "abc test",workspace: workspace}, function(response){
            $log.info("Add UserLayer: LayerName= %s & Workspace= %s ", layerGroupName, workspace)
        });

        svcLayer.addLayer(obj, function(response){
            layerGroupName = layerGroupName.replace(/ /g, '_');
            var data = response.data;
            var setType = '';

            for(var i=0; i<data.length; i++){
                setType += data[i].layer + '?' + data[i].drawType +';';
            }

            $window.location.href = '/#/view/' + svcSecurity.encode(workspace+':'+layerGroupName+':'+setType);
            $window.location.reload();
        });
    }
}