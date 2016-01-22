'use strict'

angular.module('common.accounts.controllers',[]).controller('AccountNavController', function($scope, $state, $ionicModal, $timeout, $translatePartialLoader, transit, socket, persistService, authService, User, ApplyUser, MAIL_SUFFIX) {
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

  $scope.logout = function() {
    authService.logout();
    transit.goHome();
  };

  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('js/accounts/views/register.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalRegister = modal;
  });
  // Triggered in the register modal to close it
  $scope.closeRegister = function() {
    $scope.loginData = {};
    $scope.modalRegister.hide();
  };
  // Open the register modal
  $scope.register = function() {
    $scope.modalRegister.show();
  };
  // Perform the register action when the user submits the register form
  $scope.doRegister = function() {
    authService.register($scope.loginData.username+MAIL_SUFFIX, "12345678", $scope.loginData.firstname, $scope.loginData.lastname)
      .finally(function() {
        $scope.closeRegister();
      });
  };

  // Create the change password modal that we will use later
  $ionicModal.fromTemplateUrl('js/accounts/views/changepassword.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChange = modal;
  });
  // Triggered in the change password modal to close it
  $scope.closeChange = function() {
    $scope.loginData = {};
    $scope.modalChange.hide();
  };
  // Open the change password modal
  $scope.changepassword = function() {
    $scope.finishChange = false;
    $scope.invalidChange = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-assertive';
    $scope.modalChange.show();
  };
  // Perform the change password action when the user submits the change password form
  $scope.doChange = function() {
    authService.changepassword($scope.loginData.password0, $scope.loginData.password1).then(function(data) {
      $scope.finishChange = true;
      $scope.invalidChange = false;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        $scope.closeChange();
        $scope.logout();
      }, 1000);
    },function(err) {
      $scope.finishChange = false;
      $scope.invalidChange = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    });
  };

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('common.accounts.controllers').controller('AccountLoginController', function($scope, $timeout, transit, persistService, authService, MAIL_SUFFIX) {
  $scope.mailsuffix = MAIL_SUFFIX;
  var refreshData = function() {
    $scope.loginData = {};
    $scope.invalidLogin = false;
    $scope.invalidForgot = false;
    $scope.finishForgot = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-assertive';
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.doLogin = function() {
    $scope.showFooterbar = false;
    authService.login($scope.loginData.username+MAIL_SUFFIX, $scope.loginData.password).then(function(data) {
      $scope.invalidLogin = false;
      $scope.user = persistService.get('user');
      transit.goHome();
    }, function(err) {
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
      $scope.invalidLogin = true;
    }).finally(function() {
      $scope.invalidForgot = false;
      $scope.finishForgot = false;
    });
  };
  $scope.forgot = function() {
    $scope.showFooterbar = false;
    authService.forgotpassword($scope.loginData.username+MAIL_SUFFIX, true).then(function(data) {
      $scope.invalidForgot = false;
      $scope.finishForgot = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        transit.goHome();
      }, 1000);
    }, function(err) {
      $scope.finishForgot = false;
      $scope.invalidForgot = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    }).finally(function() {
      $scope.invalidLogin = false;
    });
  };
});

angular.module('common.accounts.controllers').controller('AccountResetPasswordController', function($scope, $stateParams, $timeout, transit, authService, MAIL_SUFFIX) {
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

angular.module('common.accounts.controllers').controller('AccountUserAdminController', function($scope, $ionicPopup, socket, authService, User, ApplyUser) {
  var refreshData = function() {
    $scope.currentIdx = 0;
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
        var alert = $ionicPopup.alert({
          title: 'Reset Code',
          template: '<textarea rows="5" readonly>'+resetcode+'</textarea>'
        });
        alert.then(function(res) {
        });
      });
  };
});
angular.module('common.accounts.controllers').controller('AccountUserProfileController', function($scope, $stateParams, $timeout, transit, User, persistService, MAIL_SUFFIX) {
  var refreshData = function() {
    $scope.mailsuffix = MAIL_SUFFIX;
    $scope.invalidProfile = false;
    $scope.finishProfile = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-balanced';
    var user = persistService.get('user');
    $scope.puser = User.get({id:$stateParams.id || user._id}, function(user) {
      $scope.username = user.email.substr(0, user.email.lastIndexOf('@'));
    });
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
      $scope.invalidProfile = false;
      $scope.finishProfile = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        transit.goBack();
      }, 1000);
    },function(err) {
      $scope.invalidProfile = true;
      $scope.finishProfile = false;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    });
  };
  $scope.updatePermission = function(args) {
    $scope.puser.permission = args;
  };
});

