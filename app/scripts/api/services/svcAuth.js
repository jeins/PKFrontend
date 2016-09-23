'use strict';

angular.module('pkfrontendApp')
    .factory('svcAuth', svcAuth);

svcAuth.$inject = ['$http', 'CONFIG'];
function svcAuth($http, CONFIG){
    return {
        register: register,
        active: active
    };

    function active(hash, doneCallback){
        $http(_setupRequest('/user/active/' + hash, 'GET'))
            .then(function(response){
                doneCallback(response.data);
            }).catch(function(error){
            doneCallback(error);
        });
    }

    function register(body, doneCallback){
        $http(_setupRequest('/user/register', 'POST', body))
            .then(function(response){
                doneCallback(response.data);
            })
            .catch(function(error){
                doneCallback(error);
            })
        ;


        //var deferred = $q.defer();
        //
        //$http
        //    .post(CONFIG.http.rest_host + '/user/register', body)
        //    .then(function(result){
        //        deferred.resolve(result);
        //    })
        //    .catch(function(error){
        //        deferred.reject(error);
        //    });
        //
        //return deferred;
    }

    function _setupRequest(uri, method, data){
        return {
            url: CONFIG.http.rest_host + uri,
            method: method,
            data: data
        }
    }
}