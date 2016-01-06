'use strict'

angular.module('common.accounts.controllers',[]).controller('NavController', function($scope, $state, $ionicModal, $timeout, $translatePartialLoader, transit, socket, persistService, authService, User, ApplyUser, MAIL_SUFFIX) {
  $translatePartialLoader.addPart('accounts');
  $scope.mailsuffix = MAIL_SUFFIX;
  var refreshData = function() {
    $scope.user = persistService.get('user');
    $scope.loginData = {};
    if ($scope.user && $scope.user.permission.indexOf('admin') >= 0) {
      ApplyUser.query().success(function(data, status, config, headers) {
        $scope.applyflag = (data.length > 0);
      }).error(function(data, status, config, headers) {
        $scope.applyflag = false;
      });
    } else {
      $scope.applyflag = false;
    }
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  socket.on('table-user', function(data) {
    if (data.message=='chg' && data.email == $scope.user.email) {
      User.get({id:$scope.user._id}).$promise.then(function(user) {
        persistService.set('user', user);
        $scope.user = user;
      }, function(err) {
        authService.logout();
        transit.goHome();
      });
    }
  });
  socket.on('table-applyuser', refreshData);
  $scope.$on('authorize_changed', function(event, data) {
    refreshData();
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('js/accounts/views/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalLogin = modal;
  });
  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.loginData = {};
    $scope.modalLogin.hide();
  };
  // Open the login modal
  $scope.login = function() {
    $scope.invalidLogin = false;
    $scope.modalLogin.show();
  };
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    authService.login($scope.loginData.username+MAIL_SUFFIX, $scope.loginData.password).then(function(data) {
      $scope.user = persistService.get('user');
      $scope.closeLogin();
      transit.goHome();
    }, function(err) {
      $scope.invalidLogin = true;
    }).finally(function() {
    });
  };

  $scope.logout = function() {
    authService.logout();
    transit.goHome();
  };

  $scope.forgot = function() {
    authService.forgotpassword($scope.loginData.username+MAIL_SUFFIX, true)
      .finally(function() {
        $scope.closeLogin();
      });
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('js/accounts/views/register.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalRegister = modal;
  });
  // Triggered in the login modal to close it
  $scope.closeRegister = function() {
    $scope.loginData = {};
    $scope.modalRegister.hide();
  };
  // Open the login modal
  $scope.register = function() {
    $scope.modalRegister.show();
  };
  // Perform the login action when the user submits the login form
  $scope.doRegister = function() {
    authService.register($scope.loginData.username+MAIL_SUFFIX, "12345678", $scope.loginData.firstname, $scope.loginData.lastname)
      .finally(function() {
        $scope.closeRegister();
      });
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('js/accounts/views/changepassword.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChange = modal;
  });
  // Triggered in the login modal to close it
  $scope.closeChange = function() {
    $scope.loginData = {};
    $scope.modalChange.hide();
  };
  // Open the login modal
  $scope.changepassword = function() {
    $scope.invalidLogin = false;
    $scope.modalChange.show();
  };
  // Perform the login action when the user submits the login form
  $scope.doChange = function() {
    authService.changepassword($scope.loginData.password0, $scope.loginData.password1)
      .finally(function() {
        $scope.closeChange();
        $scope.logout();
      });
  };

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('common.accounts.controllers').controller('ResetPasswordController', function($scope, $stateParams, $timeout, transit, authService, MAIL_SUFFIX) {
  $scope.mailsuffix = MAIL_SUFFIX;
  $scope.finishReset = false;
  $scope.credentials = {
    username: $stateParams.email,
    resetcode: $stateParams.resetcode
  };
  $scope.doReset = function() {
    authService.resetpassword($scope.credentials.username+MAIL_SUFFIX, $scope.credentials.password, $scope.credentials.resetcode)
      .finally(function() {
        $scope.finishReset = true;
        $timeout(function() {
          transit.goHome();
        }, 1000);
      });
  };
});

angular.module('common.accounts.controllers').controller('UserAdminController', function($scope, $ionicPopup, socket, authService, User, ApplyUser) {
  $scope.prevTab = function() {
    if ($scope.currentIdx > 0) {
      $scope.currentIdx -= 1;
    } else {
      $scope.currentIdx += 2;
    }
  };
  $scope.nextTab = function() {
    if ($scope.currentIdx < 2) {
      $scope.currentIdx += 1;
    } else {
      $scope.currentIdx -= 2;
    }
  };
  $scope.currentIdx = 0;
  var refreshData = function() {
    $scope.users = User.query();
    ApplyUser.query().success(function(data, status, config, headers) {
      $scope.appusers = data;
    }).error(function(data, status, config, headers) {
      $scope.appusers = [];
    });
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  socket.on('table-user', refreshData);
  socket.on('table-applyuser', refreshData);
  $scope.allow = function(appid) {
    ApplyUser.allow(appid);
    refreshData();
  };
  $scope.deny = function(appid) {
    ApplyUser.deny(appid);
    refreshData();
  };
  $scope.reset = function(email) {
    authService.forgotpassword(email, false)
      .then(function(resetcode) {
        console.log(resetcode);
        var alert = $ionicPopup.alert({
          title: 'Reset Code',
          template: '<textarea rows="5" readonly>'+resetcode+'</textarea>'
        });
        alert.then(function(res) {
        });
      });
  };
});
angular.module('common.accounts.controllers').controller('UserProfileController', function($scope, $stateParams, transit, User, persistService, MAIL_SUFFIX) {
  var refreshData = function() {
    $scope.mailsuffix = MAIL_SUFFIX;
    $scope.puser = User.get({id:$stateParams.id}, function(user) {
      $scope.username = user.email.substr(0, user.email.lastIndexOf('@'));
    });
    var user = persistService.get('user');
    $scope.permission = {
      'modify': (user && user.permission.indexOf('modify') >= 0),
      'create': (user && user.permission.indexOf('create') >= 0),
      'admin': (user && user.permission.indexOf('admin') >= 0)
    };
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.doUpdate = function() {
    $scope.puser.$update(function() {
      transit.goBack();
    });
  };
  $scope.updatePermission = function(args) {
    $scope.puser.permission = args;
  };
});

