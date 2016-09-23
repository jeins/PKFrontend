'use strict';

angular.module('pkfrontendApp')
    .controller('UploadCtrl', UploadCtrl);

UploadCtrl.$inject = ['$scope', 'Upload', 'svcWorkspace', 'svcLayer','CONFIG', '$timeout', '$window', 'svcSecurity', 'svcPkLayer', '$log', 'workspace'];
function UploadCtrl($scope, Upload, svcWorkspace, svcLayer, CONFIG, $timeout,$window, svcSecurity, svcPkLayer, $log, workspace) {
    var vm = this;
    vm.init = init;
    vm.changeWorkspace = changeWorkspace;
    vm.uploadLayerGroup = uploadLayerGroup;
    vm.uploadToGeoServer = uploadToGeoServer;

    init();

    function init(){
        vm.loading = false;
        vm.timeNow = '';
        vm.workspaces = '';
        vm.selectedWorkspace = '';
        vm.layerGroupName = '';
        vm.showPoint = false; vm.showLineString = false; vm.showPolygon = false;
        vm.isCollapsed = true;
        vm.isPointSelected = 'pk-dropbox_brown'; vm.isLineSelected = 'pk-dropbox_brown'; vm.isPolySelected = 'pk-dropbox_brown';

        vm.workspaces = workspace.data;
        //svcWorkspace.getWorkspaces(function(result){
        //    vm.workspaces = result.data;
        //});
    }

    function changeWorkspace(workspace){
        vm.isCollapsed = false;
        vm.showPoint = false;
        vm.showLineString = false;
        vm.showPolygon = false;

        svcWorkspace.getWorkspaceWithDrawTyp(workspace, function(result){
            var drawTypes = result.data;
            var date = new Date();
            vm.timeNow = date.getTime();

            for(var i in drawTypes){
                if(drawTypes[i] == "Point"){
                    vm.showPoint = true;
                } else if(drawTypes[i] == "LineString"){
                    vm.showLineString = true;
                } else if(drawTypes[i] == "Polygon"){
                    vm.showPolygon = true;
                }
            }
        });
    }

    function uploadLayerGroup($file, type){
        if(_isMimeTypeAllow($file.name) && !$file.$error){
            if(type == 'point'){
                vm.isPointSelected = 'pk-dropbox_green';
            } else if(type == 'linestring'){
                vm.isLineSelected = 'pk-dropbox_green';
            } else if(type == 'polygon'){
                vm.isPolySelected = 'pk-dropbox_green';
            }

            Upload.upload({
                url: CONFIG.http.rest_host + '/layer/upload_files/' + type +'/' + vm.timeNow,
                method: 'POST',
                file: $file
            }).then(function(response){
                $timeout(function(){
                });
            })
        }
    }

    function _isMimeTypeAllow(name){
        var res = name.toLowerCase().split('.');
        if(res[res.length-1] == 'zip'){// || res[res.length-1] == 'csv' || res[res.length-1] == 'json'){
            return true;
        }
        return false;
    }

    function uploadToGeoServer(){
        vm.loading = true;

        svcPkLayer.addUserLayer({name: vm.layerGroupName, description: "abc test",workspace: vm.selectedWorkspace}, function(response){
            $log.info("Add UserLayer: LayerName= %s & Workspace= %s ", vm.layerGroupName, vm.selectedWorkspace)
        });

        svcLayer.uploadFileToGeoServer(vm.selectedWorkspace, vm.layerGroupName, vm.timeNow, function(response){
            var layerGroupName = vm.layerGroupName.replace(/ /g, '_');
            var data = response.data;
            var setType = '';

            for(var i=0; i<data.length; i++){
                setType += data[i].layer + '?' + data[i].drawType +';';
            }

            $window.location.href = '/#/view/' + svcSecurity.encode(vm.selectedWorkspace+':'+layerGroupName+':'+setType);
            $window.location.reload();
        });
    }
}