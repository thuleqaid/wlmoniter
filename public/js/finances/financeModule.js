angular.module('finances', [
  'ionic',
  'ngResource',
  // 'finances.directives',
  // 'finances.filters',
  'finances.services',
  'finances.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('finance', {
      url: '/finance',
      abstract: true,
      templateUrl: 'js/finances/views/menu.html',
      controller: 'FinanceNavController'
    })
    .state('finance.overview', {
      url: '/overview',
      views: {
        'menuContent': {
          templateUrl: 'js/finances/views/overview.html',
          controller: 'FinanceOverviewController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    });
});

angular.module('finances').run(function($rootScope, transit, authService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      authService.logout();
      transit.go('account.login');
    }
  });
});

