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

    _init();

    /**
     * main
     *
     * @private
     */
    function _init(){
        var point = [], line=[], poly=[];
        vm.loading = false;
        vm.setDrawTypes = [];
        vm.setWorkspaces = [];
        vm.layerGroupName = '';
        vm.description = '';
        vm.alerts = [];
        vm.isNlpSelected = false;
        vm.selectedNlpScale = '250k';

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

    /**
     * event select draw type
     *
     * @param value
     */
    function selectedDrawType(value){
        if(value === 'nlp') vm.isNlpSelected = true;
        else vm.isNlpSelected = false;
        svcSharedProperties.sendBroadcast(function(v){
            $scope.$emit('pk.draw.selectedDrawType', {drawType: value, scale: vm.selectedNlpScale});
        });
    }

    /**
     * check if require information already insert to enable save button
     *
     * @param text
     * @returns {boolean}
     */
    function isDisabled(text){
        if(text == "" || svcSharedProperties.getLayerValues() == undefined){
            return true;
        }
        return false;
    }

    /**
     * event push alert
     *
     * @param layerGroupName
     */
    function addAlert(layerGroupName){
        vm.alerts.push({type: 'success', msg: 'Layer '+layerGroupName+' telah dibuat!'});
    }

    /**
     * event close box laert
     *
     * @param index
     */
    function closeAlert(index){
        vm.alerts.splice(index, 1);
    }

    /**
     * event change workspace
     *
     * @param workspace
     */
    function changeWorkspace(workspace){
        $log.info("selected workspace: %s", workspace);
        svcWorkspace.getWorkspaceWithDrawTyp(workspace, function(result){
            vm.setDrawTypes = result.data;
        });
    }

    /**
     * save layer to geoserver
     *
     * @param workspace
     */
    function saveLayer(workspace){
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
            "name": vm.layerGroupName,
            "workspace": workspace,
            "coordinates": tmpType
        };

        svcPkLayer.addUserLayer({name: vm.layerGroupName, description: vm.description, workspace: workspace}, function(response){
            $log.info("Add UserLayer: LayerName= %s & Workspace= %s ", vm.layerGroupName, workspace)
        });

        svcLayer.addLayer(obj, function(response){
            vm.layerGroupName = vm.layerGroupName.replace(/ /g, '_');
            var data = response;
            var setType = '';

            for(var i=0; i<data.length; i++){
                setType += data[i].layer + '?' + data[i].drawType +';';
            }

            $log.info("Add GeoServerLayer: LayerGroupName= %s & Workspace= %s & Type= %s", vm.layerGroupName, workspace, setType);

            $window.location.href = '/#/view/' + svcSecurity.encode(workspace+':'+vm.layerGroupName+':'+setType);
            $window.location.reload();
        });
    }
}