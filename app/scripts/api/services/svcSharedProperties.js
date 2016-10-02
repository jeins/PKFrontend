'use strict';

angular.module('pkfrontendApp')
    .factory('svcSharedProperties', svcSharedProperties);

svcSharedProperties.$inject = ['$timeout', '$q', '$http'];

function svcSharedProperties($timeout, $q, $http){
    var layerValues;
    var selectedNav;
    
    function tester(){
        var deferred = $q.defer();
        $http
            .get('http://94.177.245.142/api/users')
            .then(function(result){
                deferred.resolve(result);
            })
            .catch(function(error){
                deferred.reject(error);
            });
        return deferred.promise;
    }

    function setLayerValues(values){
        layerValues = values;
    }

    function getLayerValues(){
        return layerValues;
    }

    function setSelectedNav(nav){
        selectedNav = nav;
    }

    function getSelectedNav(){
        return selectedNav;
    }

    function sendBroadcast(doneCallback){
        $timeout(function(){
            doneCallback("ok");
        }, 10);
    }

    return {
        setSelectedNav:setSelectedNav,
        getSelectedNav:getSelectedNav,
        setLayerValues: setLayerValues,
        getLayerValues: getLayerValues,
        sendBroadcast: sendBroadcast,
        tester:tester
    }
}