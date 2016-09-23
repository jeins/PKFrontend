'use strict';

angular.module('pkfrontendApp')
    .factory('svcPkLayer', svcPkLayer);

svcPkLayer.$inject = ['$http', 'CONFIG'];
function svcPkLayer($http, CONFIG){
	return {
		getUserLayers: getUserLayers,
		getByWorkspace: getByWorkspace,
		getLayers: getLayers,
		addUserLayer: addUserLayer
	};

	function getUserLayers(doneCallback){
        $http(_setupRequest('/ulayer/user', 'GET'))
            .then(function(response){
                doneCallback(response.data);
            });
	}

	function getByWorkspace(workspace, doneCallback){
        $http(_setupRequest('/ulayer/workspace/' + workspace, 'GET'))
            .then(function(response){
                doneCallback(response.data);
            });
	}

	function getLayers(limit, currentPage, doneCallback){
        $http(_setupRequest('/ulayer/' + limit + '/' + currentPage, 'GET'))
            .then(function(response){
                doneCallback(response.data);
            });
	}

	function addUserLayer(body, doneCallback){
        $http(_setupRequest('/ulayer/add', 'POST', body))
            .then(function (response){
                doneCallback(response.data);
            });
	}

    function _setupRequest(uri, method, data){
        return {
            url: CONFIG.http.rest_host + uri,
            method: method,
            data: data
        }
    }
}