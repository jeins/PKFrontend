'use strict';

angular
    .module('pkfrontendApp')
    .config(['$routeProvider', 'CONFIG',
    function ($routeProvider, CONFIG) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/map/map.html',
                controller: 'MapCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.user
            })
            .when('/view/:layer', {
                templateUrl: 'views/map/map.html',
                controller: 'ViewLayerCtrl',
                controllerAs: 'CVL',
                permission: CONFIG.session.user
            })
            .when('/browse', {
                templateUrl: 'views/features/browse.html',
                controller: 'BrowseCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.user
            })
            .when('/edit/:layer', {
                templateUrl: 'views/map/map.html',
                controller: 'EditLayerCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.user
            })
            .when('/draw', {
                templateUrl: 'views/map/map.html',
                controller: 'MapCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.user
            })
            .when('/upload', {
                templateUrl: 'views/features/upload.html',
                controller: 'UploadCtrl',
                resolve:{
                    workspace: function(svcWorkspace){
                        return svcWorkspace.getWorkspacesFromRoutes();
                    }
                },
                controllerAs: 'vm',
                permission: CONFIG.session.user
            })
            .when('/register', {
                templateUrl: 'views/auth/register.html',
                controller: 'AuthCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.guest
            })
            .when('/login', {
                templateUrl: 'views/auth/login.html',
                controller: 'AuthCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.guest
            })
            .when('/active/:hash', {
                templateUrl: 'views/auth/active.html',
                controller: 'AuthCtrl',
                controllerAs: 'vm',
                permission: CONFIG.session.guest
            })
            .otherwise({
                redirectTo: '/'
            })
        ;
    }]);