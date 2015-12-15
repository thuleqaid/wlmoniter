angular.module('common.accounts', [
  'ngCookies',
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
  // $locationProvider.html5Mode(true);
}]);

angular.module('common.accounts').run(['$rootScope', '$state', '$cookieStore', 'authService', function($rootScope, $state, $cookieStore, authService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      $state.go("login");
    } else if (error.authorized) {
      $state.go("allOrders");
    }
  });
  authService.user = $cookieStore.get('user');
  authService.token = $cookieStore.get('token');
  if (authService.user && authService.token) {
  } else {
    if(window.localStorage){
      authService.user = JSON.parse(window.localStorage.getItem('user'));
      authService.token = window.localStorage.getItem('token');
    }
  }
}]);

