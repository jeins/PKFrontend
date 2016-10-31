'use strict';

angular.module('pkfrontendApp')
    .controller('AuthCtrl', AuthCtrl);

AuthCtrl.$inject = ["$auth", "$log", "$window", "svcAuth", "$routeParams"];
function AuthCtrl($auth, $log, $window, svcAuth, $routeParams){
	var vm = this;
	vm.init = init;
	vm.login = login;
	vm.register = register;
	vm.logout = logout;
    vm.closeAlert = closeAlert;

	init();

	function init(){
		vm.loading = false;
		vm.data = {};
		vm.data.email = "demo@demo.com";
		vm.data.password = "demo";
		vm.data.full_name = "demo user";
		vm.activation = false;
		vm.disabledForm = false;
		vm.btnDisabled = false;

        vm.alert = [
            {type: "danger", message: "Email Already Exist!", show: false},
            {type: "danger", message: "Email / Password Salah!", show: false},
			{type: "success", message: "Register Success, check your E-Mail!", show: false}
        ];

		if($routeParams.hash){
			_activation($routeParams.hash);
		}
	}

	function _activation($hash){
		svcAuth.active($hash, function(response){
			if(response.result == "OK"){
				vm.activation = true;
				$log.info("OK");
			} else{
				$window.location.href = '#/';
				$window.location.reload();
			}
		})
	}

	function login(){
		vm.loading = true;
		$auth.login({ email: vm.data.email, password: vm.data.password })
            .then(function(response) {
				if(response.data.error){
					vm.loading = false;
					vm.alert[1].show = true;
					vm.alert[1].message = response.data.msg;
				} else{
					$log.info("Success Login Manual");
					$window.location.href = '#/';
					$window.location.reload();
				}
            })
            .catch(function(response) {
				vm.loading = false;
                vm.alert[1].show = true;
                $log.error(response.data.message);
            });
	}

	function register(){
		vm.loading = true;
		vm.btnDisabled = true;
		svcAuth.register(vm.data, function(response){
			$log.info(response);
			if(response.error){
				vm.loading = false;
				vm.alert[0].show = true;
				$log.error(response.error);
			} else{
				vm.loading = false;
				vm.disabledForm = true;
				vm.alert[2].show = true;
				$log.info(response.success);
			}
		});
	}

	function logout(){
		if(!$auth.isAuthenticated()){
			return;
		}
		$auth.logout()
			.then(function(){
				$window.location.href = '#/';
                $window.location.reload();
				$log.info("Logout");
			});
	}

    function closeAlert($index){
		vm.loading = false;
        vm.alert[$index].show = false;
    }
}