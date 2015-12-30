angular.module('common.accounts', [
  'ui.router',
  'common.accounts.directives',
  'common.accounts.filters',
  'common.accounts.services',
  'common.accounts.controllers'
]);

angular.module('common.accounts').config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'javascripts/modules/accounts/views/login.html',
    controller: 'LoginController',
    resolve: {
      user:['persistService', '$q', function(persistService, $q) {
        if (persistService.get('user')) {
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
    url: '/resetpassword/:resetcode/:email',
    templateUrl: 'javascripts/modules/accounts/views/resetpassword.html',
    controller: 'ResetPasswordController'
  });
  $stateProvider.state('forgotpassword', {
    url: '/forgotpassword',
    templateUrl: 'javascripts/modules/accounts/views/forgotpassword.html',
    controller: 'ForgotPasswordController'
  });
  $stateProvider.state('useradmin', {
    url: '/useradmin',
    templateUrl: 'javascripts/modules/accounts/views/useradmin.html',
    controller: 'UserAdminController'
  });
  $stateProvider.state('userprofile', {
    url: '/userprofile/:id',
    templateUrl: 'javascripts/modules/accounts/views/userprofile.html',
    controller: 'UserProfileController'
  });
  // $locationProvider.html5Mode(true);
}]);

angular.module('common.accounts').run(['$rootScope', '$state', 'persistService', function($rootScope, $state, persistService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      $state.go("login");
    } else if (error.authorized) {
      var user = User.get({id:persistService.get('user')._id}, function(user) {
        persistService.set('user', user);
      });
      $state.go("allOrders");
    }
  });
}]);

