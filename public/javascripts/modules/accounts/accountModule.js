angular.module('common.accounts', [
  'ui.router',
  // 'common.accounts.directives',
  // 'common.accounts.filters',
  'common.accounts.services',
  'common.accounts.controllers'
]);

angular.module('common.accounts').config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'javascripts/modules/accounts/views/login.html',
    controller: 'LoginController',
    resolve: {
      user:['authService', '$q', function(authService, $q) {
        if (authService.user) {
          return $q.reject({authorized:true});
        }
      }]
    }
  });
  $stateProvider.state('register', {
    url: '/register',
    templateUrl: 'javascripts/modules/accounts/views/register.html',
    controller: 'RegisterController'
  });
  $stateProvider.state('resetpassword', {
    url: '/resetpassword',
    templateUrl: 'javascripts/modules/accounts/views/resetpassword.html',
    controller: 'ResetPasswordController'
  });
  $stateProvider.state('forgotpassword', {
    url: '/forgotpassword',
    templateUrl: 'javascripts/modules/accounts/views/forgotpassword.html',
    controller: 'ForgotPasswordController'
  });
  // $locationProvider.html5Mode(true);
}]);

angular.module('common.accounts').run(['$rootScope', '$state', 'persistService', 'authService', function($rootScope, $state, persistService, authService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      $state.go("login");
    } else if (error.authorized) {
      $state.go("allOrders");
    }
  });
  authService.user = persistService.get('user');
  authService.token = persistService.get('token');
}]);

