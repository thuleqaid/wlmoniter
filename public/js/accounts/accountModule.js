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
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'js/accounts/views/menu.html',
      controller: 'NavController'
    })
    .state('app.search', {
      url: '/search',
      views: {
        'menuContent': {
          template: '<ion-view view-title="Search"><ion-content><h1>Search</h1></ion-content></ion-view>'
        }
      }
    })
    .state('app.resetpassword', {
      url: '/resetpassword/:resetcode/:email',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/resetpassword.html',
          controller: 'ResetPasswordController'
        }
      }
    })
    .state('app.useradmin', {
      url: '/useradmin',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/useradmin.html',
          controller: 'UserAdminController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('app.userprofile', {
      url: '/userprofile/:id',
      views: {
        'menuContent': {
          templateUrl: 'js/accounts/views/userprofile.html',
          controller: 'UserProfileController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    });
  $urlRouterProvider.otherwise('/app/search');
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
    if (error.unAuthorized) {
      authService.logout();
      transit.goHome();
    }
  });
});

