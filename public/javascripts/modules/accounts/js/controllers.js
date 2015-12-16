'use strict'

angular.module('common.accounts.controllers', []).controller('LoginController', ['$scope', 'authService', '$state', 'DEFAULT_ROUTE', function($scope, authService, $state, DEFAULT_ROUTE) {
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
    $state.go('forgotpassword');
  };
}]);

angular.module('common.accounts.controllers').controller('RegisterController', ['$scope', 'authService', '$state', function($scope, authService, $state) {
  $scope.register = function() {
    authService.register($scope.credentials.username+"@kotei-info.com", "12345678", $scope.credentials.firstname, $scope.credentials.lastname);
    $state.go('login');
  };
}]);

angular.module('common.accounts.controllers').controller('ResetPasswordController', ['$scope', 'authService', '$state', function($scope, authService, $state) {
  $scope.resetpassword = function() {
    authService.resetpassword($scope.credentials.username+"@kotei-info.com", $scope.credentials.password, $scope.credentials.resetcode);
    $state.go('login');
  };
}]);

angular.module('common.accounts.controllers').controller('ForgotPasswordController', ['$scope', 'authService', '$state', function($scope, authService, $state) {
  $scope.forgotpassword = function() {
    authService.forgotpassword($scope.credentials.username+"@kotei-info.com");
    $state.go('resetpassword');
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
  $scope.transReg = function() {
    $state.go('register');
  };
  $scope.transLogin = function() {
    $state.go('login');
  };
  $scope.transPassword = function() {
    $state.go('resetpassword');
  };
}]);
