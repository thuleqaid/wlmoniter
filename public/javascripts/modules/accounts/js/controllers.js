'use strict'

angular.module('common.accounts.controllers', []).controller('LoginController', ['$scope', 'authService', '$state', 'DEFAULT_ROUTE', 'MAIL_SUFFIX', function($scope, authService, $state, DEFAULT_ROUTE, MAIL_SUFFIX) {
  $scope.buttonText = "Login";
  $scope.mailsuffix = MAIL_SUFFIX;
  $scope.login = function() {
    $scope.buttonText = "Logging in ...";
    authService.login($scope.credentials.username+MAIL_SUFFIX, $scope.credentials.password).then(function(data) {
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

angular.module('common.accounts.controllers').controller('RegisterController', ['$scope', 'authService', '$state', 'MAIL_SUFFIX', function($scope, authService, $state, MAIL_SUFFIX) {
  $scope.mailsuffix = MAIL_SUFFIX;
  $scope.register = function() {
    authService.register($scope.credentials.username+MAIL_SUFFIX, "12345678", $scope.credentials.firstname, $scope.credentials.lastname);
    $state.go('login');
  };
}]);

angular.module('common.accounts.controllers').controller('ResetPasswordController', ['$scope', 'authService', '$state', '$stateParams', 'MAIL_SUFFIX', function($scope, authService, $state, $stateParams, MAIL_SUFFIX) {
  $scope.mailsuffix = MAIL_SUFFIX;
  $scope.credentials = {
    username: $stateParams.email,
    resetcode: $stateParams.resetcode
  };
  $scope.resetpassword = function() {
    authService.resetpassword($scope.credentials.username+MAIL_SUFFIX, $scope.credentials.password, $scope.credentials.resetcode);
    $state.go('login');
  };
}]);

angular.module('common.accounts.controllers').controller('ForgotPasswordController', ['$scope', 'authService', '$state', 'MAIL_SUFFIX', function($scope, authService, $state, MAIL_SUFFIX) {
  $scope.mailsuffix = MAIL_SUFFIX;
  $scope.forgotpassword = function() {
    authService.forgotpassword($scope.credentials.username+MAIL_SUFFIX);
    $state.go('resetpassword', {email:$scope.credentials.username});
  };
}]);

angular.module('common.accounts.controllers').controller('UserAdminController', ['$scope', '$state', 'User', 'ApplyUser', 'socket', function($scope, $state, User, ApplyUser, socket) {
  var refreshData = function() {
    $scope.users = User.query();
    ApplyUser.query().success(function(data, status, config, headers) {
      $scope.appusers = data;
    }).error(function(data, status, config, headers) {
      $scope.appusers = [];
    });
  };
  socket.on('table-user', refreshData);
  socket.on('table-applyuser', refreshData);
  refreshData();
  $scope.allow = function(appid) {
    ApplyUser.allow(appid);
    refreshData();
  };
  $scope.deny = function(appid) {
    ApplyUser.deny(appid);
    refreshData();
  };
}]);

angular.module('common.accounts.controllers').controller('UserProfileController', ['$scope', '$state', '$stateParams', 'User', 'persistService', 'MAIL_SUFFIX', 'DEFAULT_ROUTE', function($scope, $state, $stateParams, User, persistService, MAIL_SUFFIX, DEFAULT_ROUTE) {
  $scope.mailsuffix = MAIL_SUFFIX;
  $scope.puser = User.get({id:$stateParams.id}, function(user) {
    $scope.username = user.email.substr(0, user.email.lastIndexOf('@'));
  });
  $scope.permission = {
    'modify': (persistService.get('user').permission.indexOf('modify') >= 0),
    'create': (persistService.get('user').permission.indexOf('create') >= 0),
    'admin': (persistService.get('user').permission.indexOf('admin') >= 0)
  };
  $scope.updateProfile = function() {
    $scope.puser.$update(function() {
      $state.go(DEFAULT_ROUTE, {}, {reload:true});
    });
  };
  $scope.updatePermission = function(args) {
    $scope.puser.permission = args;
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
