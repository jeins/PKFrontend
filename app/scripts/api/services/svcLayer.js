'use strict';

angular.module('pkfrontendApp')
    .factory('svcLayer', [
        '$q', '$http', 'CONFIG', function($q, $http, CONFIG) {

            /**
             * service get layers from workspace
             *
             * @param workspace
             * @param doneCallback
             */
            function getLayersFromWorkspace(workspace, doneCallback){
                $http(_setupRequest('/layer/'+workspace, 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            /**
             * get layer with draw type
             *
             * @param workspace
             * @param layerGroupName
             * @param doneCallback
             */
            function getLayerAndDrawType(workspace, layerGroupName, doneCallback){
                $http(_setupRequest('/layer/'+workspace+'/'+layerGroupName, 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            /**
             * get feature collection in type (geo)json
             *
             * @param workspace
             * @param layerGroupName
             * @param doneCallback
             */
            function getFeatureCollectionGeoJson(workspace, layerGroupName, doneCallback){
                $http(_setupRequest('/layer/'+workspace+'/'+layerGroupName+'/geojson', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            /**
             * get feature collection filtering by specific layer
             *
             * @param workspace
             * @param layer
             * @param doneCallback
             */
            function getFeatureCollectionFilterByLayer(workspace, layer, doneCallback){
                $http(_setupRequest('/layer/' + workspace +'/'+ layer +'/bylayer/geojson', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    })
            }

            /**
             * get view size of layer group
             *
             * @param workspace
             * @param layerGroupName
             * @param doneCallback
             */
            function getBbox(workspace, layerGroupName, doneCallback){
                $http(_setupRequest('/layer/'+workspace+'/'+layerGroupName+'/bbox', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            /**
             * get draw type of layer
             *
             * @param workspace
             * @param layerGroupName
             * @param layer
             * @param doneCallback
             */
            function getDrawType(workspace, layerGroupName, layer, doneCallback){
                $http(_setupRequest('/layer/' + workspace +'/' + layerGroupName +'/' + layer +'/drawtype', 'GET'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            /**
             * add new layer
             *
             * @param body
             * @param doneCallback
             */
            function addLayer(body, doneCallback){
                $http(_setupRequest('/layer/add', 'POST', body))
                    .then(function (response){
                        doneCallback(response.data);
                    });
            }

            /**
             * edit layer
             *
             * @param body
             * @param doneCallback
             */
            function editLayer(body, doneCallback){
                $http(_setupRequest('/layer/edit', 'PUT', body))
                    .then(function (response){
                        doneCallback(response.data);
                    });
            }

            /**
             * test geoserver connection
             *
             * @param doneCallback
             */
            function geoserver(doneCallback){
                $http(_setupRequest('/layer/geoserver', 'POST'))
                    .then(function (response){
                        doneCallback(response.data);
                    });
            }

            /**
             * import layer files to geoserver
             *
             * @param workspace
             * @param dataStore
             * @param key
             * @param doneCallback
             */
            function uploadFileToGeoServer(workspace, dataStore, key, doneCallback){
                $http(_setupRequest('/layer/upload_layers/' + workspace +'/' +dataStore +'/'+ key, 'POST'))
                    .then(function(response){
                        doneCallback(response.data);
                    });
            }

            /**
             * setup api request
             *
             * @param uri
             * @param method
             * @param data
             * @returns {{url: string, method: *, data: *}}
             * @private
             */
            function _setupRequest(uri, method, data){
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