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

    /**
     * get user layers
     *
     * @param doneCallback
     */
	function getUserLayers(doneCallback){
        $http(_setupRequest('/ulayer/user', 'GET'))
            .then(function(response){
                doneCallback(response.data);
            });
	}

    /**
     * get user layer by workspace
     *
     * @param workspace
     * @param doneCallback
     */
	function getByWorkspace(workspace, doneCallback){
        $http(_setupRequest('/ulayer/workspace/' + workspace, 'GET'))
            .then(function(response){
                doneCallback(response.data);
            });
	}

    /**
     * get all user layer with pagination & sort function
     *
     * @param sortBy
     * @param limit
     * @param currentPage
     * @param doneCallback
     */
	function getLayers(sortBy, limit, currentPage, doneCallback){
        $http(_setupRequest('/ulayers/' + sortBy + '/' + limit + '/' + currentPage, 'GET'))
            .then(function(response){
                doneCallback(response.data);
            });
	}

    /**
     * add user layer
     *
     * @param body
     * @param doneCallback
     */
	function addUserLayer(body, doneCallback){
        $http(_setupRequest('/ulayer/add', 'POST', body))
            .then(function (response){
                doneCallback(response.data);
            });
	}

    /**
     * setup request
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
}