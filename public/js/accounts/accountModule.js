angular.module('common.accounts', [
  'ionic',
  'ngResource',
  'common.accounts.directives',
  'common.accounts.filters',
  'common.accounts.services',
  'common.accounts.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('account', {
      url: '/account',
      abstract: true,
      templateUrl: 'js/accounts/views/menu.html',
      controller: 'AccountNavController'
    })
    .state('account.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/login.html',
          controller: 'AccountLoginController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') && $q.reject({authorized:true});
        }]
      }
    })
    .state('account.resetpassword', {
      url: '/resetpassword/:resetcode/:email',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/resetpassword.html',
          controller: 'AccountResetPasswordController'
        }
      }
    })
    .state('account.useradmin', {
      url: '/useradmin',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/useradmin.html',
          controller: 'AccountUserAdminController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('account.userprofile', {
      url: '/userprofile/:id',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/userprofile.html',
          controller: 'AccountUserProfileController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    });
  // $urlRouterProvider.otherwise('/account/search');
});

angular.module('common.accounts').run(function($rootScope, transit, persistService, authService, User) {
  var bkuser = persistService.get('user');
  if (bkuser) {
    User.get({id:bkuser._id}).$promise.then(function(user) {
      persistService.set('user', user);
    }, function(err) {
      authService.logout();
      transit.goHome();
    });
  }
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.authorized) {
      transit.goHome();
    }
    if (error.unAuthorized) {
      authService.logout();
      transit.go('account.login');
    }
  });
});

