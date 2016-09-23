'use strict';

angular.module('pkfrontendApp')
    .factory('svcLayer', [
        '$q', '$http', 'CONFIG', function($q, $http, CONFIG) {

            function getLayersFromWorkspace(workspace, doneCallback){
                $http(setupRequest('/layer/'+workspace, 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            function getLayerAndDrawType(workspace, layerGroupName, doneCallback){
                $http(setupRequest('/layer/'+workspace+'/'+layerGroupName, 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            function getFeatureCollectionGeoJson(workspace, layerGroupName, doneCallback){
                $http(setupRequest('/layer/'+workspace+'/'+layerGroupName+'/geojson', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            function getFeatureCollectionFilterByLayer(workspace, layer, doneCallback){
                $http(setupRequest('/layer/' + workspace +'/'+ layer +'/bylayer/geojson', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    })
            }

            function getBbox(workspace, layerGroupName, doneCallback){
                $http(setupRequest('/layer/'+workspace+'/'+layerGroupName+'/bbox', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            function getDrawType(workspace, layerGroupName, layer, doneCallback){
                $http(setupRequest('/layer/' + workspace +'/' + layerGroupName +'/' + layer +'/drawtype', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            function addLayer(body, doneCallback){
                $http(setupRequest('/layer/add', 'POST', body))
                    .then(function (response){
                        doneCallback(response.data);
                    });
            }

            function editLayer(body, doneCallback){
                $http(setupRequest('/layer/edit', 'PUT', body))
                    .then(function (response){
                        doneCallback(response.data);
                    });
            }

            function geoserver(doneCallback){
                $http(setupRequest('/layer/geoserver', 'POST'))
                    .then(function (response){
                        doneCallback(response.data);
                    });
            }

            function uploadFileToGeoServer(workspace, dataStore, key, doneCallback){
                $http(setupRequest('/layer/upload_layers/' + workspace +'/' +dataStore +'/'+ key, 'POST'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            function setupRequest(uri, method, data){
                return {
                    url: CONFIG.http.rest_host + uri,
                    method: method,
                    data: data
                }
            }

            return {
                addLayer: addLayer,
                editLayer: editLayer,
                uploadFileToGeoServer: uploadFileToGeoServer,
                geoserver: geoserver,
                getLayersFromWorkspace: getLayersFromWorkspace,
                getLayerAndDrawType: getLayerAndDrawType,
                getFeatureCollectionGeoJson: getFeatureCollectionGeoJson,
                getFeatureCollectionFilterByLayer: getFeatureCollectionFilterByLayer,
                getBbox: getBbox,
                getDrawType: getDrawType
            }
        }]);