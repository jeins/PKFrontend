'use strict';

angular.module('pkfrontendApp')
    .factory('svcSession', svcSession);

svcSession.$inject = ['$rootScope', '$log', 'CONFIG', '$window'];
function svcSession($rootScope, $log, CONFIG, $window){
    var session = {};

    function resetSession(){
        session.loggedIn = false;
        $rootScope.$emit('session:update', session);
        $log.info("Session reset");
    }

    function init(){
        if($window.localStorage[CONFIG.session.key]){
            setSession();
        } else{
            resetSession();
        }
    }

    function setSession(){
        session.loggedIn = true;
        $rootScope.$emit('session:update', session);
        $log.info("Session set");
    }

    function getSession(){
        return session;
    }

    init();

    return {
        getSession: getSession,
        resetSession: resetSession,
        setSession: setSession
    };
}