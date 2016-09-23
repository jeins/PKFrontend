'use strict';

angular.module('pkfrontendApp')
    .factory('svcWorkspace', [
        '$q', '$http', 'CONFIG', function($q, $http, CONFIG) {
            function getWorkspaces(doneCallback){
                $http(setupRequest('/workspace/all', 'GET', ''))
                    .then(function (response){
                        doneCallback(response);
                    });
            }

            function getWorkspaceWithDrawTyp(workspace, doneCallback){
                $http(setupRequest('/workspace/'+workspace+'/draw', 'GET', ''))
                    .then(function (response){
                        doneCallback(response);
                    });
            }

            function getWorkspacesFromRoutes(){
                var deferred = $q.defer();
                $http
                    .get(CONFIG.http.rest_host + '/workspace/all')
                    .then(function(result){
                        deferred.resolve(result);
                    })
                    .catch(function(error){
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

            function setupRequest(uri, method, data){
                return {
                    url: CONFIG.http.rest_host + uri,
                    method: method,
                    data: data
                }
            }

            return {
                getWorkspaces: getWorkspaces,
                getWorkspacesFromRoutes: getWorkspacesFromRoutes,
                getWorkspaceWithDrawTyp: getWorkspaceWithDrawTyp
            }
        }]);