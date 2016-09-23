'use strict';

angular
  .module('pkfrontendApp', [
      'ngAnimate', 'ngRoute', 'ui.bootstrap', 'smart-table',
      'ngSanitize', 'ngFileUpload', 'satellizer', 'pascalprecht.translate'
  ])

    .run(['$rootScope', '$location', 'svcSession', 'CONFIG', '$log',
        function ($rootScope, $location, svcSession, CONFIG, $log) {

            $rootScope.$on('$routeChangeStart', function( event, next, current ) {
                $log.info('APP.js onRoutChangeStart (event): %s ', event);
                $log.info('                          (next): %s ', JSON.stringify(next));
                $log.info('                       (current): %s ', current);

                var session = svcSession.getSession();
                var permission = next['permission'];

                if((session.loggedIn && permission == CONFIG.session.user) || permission == CONFIG.session.guest){
                    $log.info('wanted behaviour to %s', next.$$route.originalPath);
                } else{
                    $rootScope.$evalAsync(function () {
                        $location.path('/');
                    })
                }
            });

            //* in case of error goto /home (if not authenticated)
            $rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {
                $log.info('APP.js onRouteChangeError (event): %s ', event);
                $log.info('                           (next): %s ', JSON.stringify(next));
                $log.info('                        (current): %s ', current);
                if (eventObj.authenticated === false) {
                    $location.path('/');
                }
            });

            //* in case of success go on
            $rootScope.$on('$routeChangeSuccess', function( event, next ) {
                // .. nothing yet ...
            });

        }
    ])
;
