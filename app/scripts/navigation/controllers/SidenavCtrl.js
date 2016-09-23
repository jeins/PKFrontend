'use strict';

angular.module('pkfrontendApp')
    .controller('SidenavCtrl', SidenavCtrl);

SidenavCtrl.$inject = ['$scope', '$location', '$log', 'svcSession'];
function SidenavCtrl($scope, $location, $log, svcSession) {
    var vm = this;
    vm.init = init;
    vm.toggleSideNav = toggleSideNav;
    vm.hideSideNav = hideSideNav;
    vm.isNavActive = isNavActive;

    init();

    function init(){
        vm.sideNavContent = $location.path();
        vm.session = svcSession.getSession();
        vm.isLogedIn = vm.session.loggedIn;

        hideSideNav();

        $scope.$on('session:update', function (event, data) {
            vm.isLogedIn = data.loggedIn;
            $log.info("User is login");
        });

        if($location.path().match("view")){
            toggleSideNav('browse');
        } else if($location.path().match('edit')){
            toggleSideNav('edit');
        } else if($location.path().match('draw')){
            toggleSideNav('draw');
        }

        isNavActive($location.path());
    }

    function toggleSideNav(content){
        hideSideNav();
        if(content != "upload" || content != "browse"){
            vm.sidenavClass = "pk-sidenav_show";
            vm.mapClass = "pk-map_canvas80";
        }
        vm.sideNavContent = content;
    }

    function hideSideNav(){
        vm.sidenavClass = "pk-sidenav_hide";
        vm.mapClass = "pk-map_canvas100";
        vm.sideNavContent = 'home';
    }

    function isNavActive(content){
        if(vm.sideNavContent == content){
            return 'active';
        }
        return '';
    }
}