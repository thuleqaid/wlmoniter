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

angular.module('common.accounts.controllers').controller('ResetPasswordController', ['$scope', 'authService', '$state', '$stateParams', function($scope, authService, $state, $stateParams) {
  $scope.credentials = {
    username: $stateParams.email,
    resetcode: $stateParams.resetcode
  };
  $scope.resetpassword = function() {
    authService.resetpassword($scope.credentials.username+"@kotei-info.com", $scope.credentials.password, $scope.credentials.resetcode);
    $state.go('login');
  };
}]);

angular.module('common.accounts.controllers').controller('ForgotPasswordController', ['$scope', 'authService', '$state', function($scope, authService, $state) {
  $scope.forgotpassword = function() {
    authService.forgotpassword($scope.credentials.username+"@kotei-info.com");
    $state.go('resetpassword', {email:$scope.credentials.username});
  };
}]);

angular.module('common.accounts.controllers').controller('UsersAdminController', ['$scope', '$state', 'User', 'ApplyUser', function($scope, $state, User, ApplyUser) {
  var removeItem = function(appid) {
    for (var idx = 0; idx < $scope.appusers.length; idx ++) {
      if ($scope.appusers[idx]._id == appid) {
        $scope.appusers.splice(idx, 1);
        break;
      }
    }
  };
  var refreshData = function() {
    $scope.users = User.query();
    ApplyUser.query().success(function(data, status, config, headers) {
      $scope.appusers = data;
    }).error(function(data, status, config, headers) {
      $scope.appusers = [];
    });
  };
  refreshData();
  $scope.allow = function(appid) {
    removeItem(appid);
    ApplyUser.allow(appid);
    refreshData();
  };
  $scope.deny = function(appid) {
    removeItem(appid);
    ApplyUser.deny(appid);
    refreshData();
  };
}]);

angular.module('common.accounts.controllers').controller('NavController', ['$scope', 'authService', '$state', 'DEFAULT_ROUTE', function($scope, authService, $state, DEFAULT_ROUTE) {
  $scope.user = authService.user;

  $scope.$on('authorize_changed', function(event, data) {
    $scope.user = authService.user;
    if (data==='logout') {
      $scope.transDefault();
    }
  });
  $scope.logout = function() {
    authService.logout();
  };
  $scope.transDefault = function() {
    $state.go(DEFAULT_ROUTE, {}, {reload:true});
  };
}]);
