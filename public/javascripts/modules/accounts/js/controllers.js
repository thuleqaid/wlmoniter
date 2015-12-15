'use strict'

angular.module('common.accounts.controllers', ['ngCookies']).controller('LoginController', ['$scope', 'authService', '$state', 'DEFAULT_ROUTE', function($scope, authService, $state, DEFAULT_ROUTE) {
  $scope.buttonText = "Login";
  $scope.login = function() {
    $scope.buttonText = "Logging in ...";
    authService.login($scope.credentials.username+"@kotei-info.com", $scope.credentials.password).then(function(data) {
      $scope.invalidLogin = false;
      $state.go(DEFAULT_ROUTE);
    }, function(err) {
      $scope.invalidLogin = true;
    }).finally(function() {
      $scope.buttonText = "Login";
    });
  };
  $scope.forgot = function() {
    console.log("forgot");
  };
}]);

angular.module('common.accounts.controllers').controller('NavController', ['$scope', 'authService', '$state', 'DEFAULT_ROUTE', function($scope, authService, $state, DEFAULT_ROUTE) {
  $scope.user = authService.user;

  $scope.$on('authorize_changed', function(event, data) {
    $scope.user = authService.user;
    if (data==='logout') {
      if ($state.current.name !== DEFAULT_ROUTE) {
        $state.go(DEFAULT_ROUTE);
      } else {
        $state.go('login');
      }
    }
  });
  $scope.logout = function() {
    authService.logout();
  };
}]);
