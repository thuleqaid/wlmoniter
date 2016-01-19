angular.module('projects', [
  'ionic',
  'ngResource',
  // 'projects.directives',
  // 'projects.filters',
  'projects.services',
  'projects.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('project', {
      url: '/project',
      abstract: true,
      templateUrl: 'js/projects/views/menu.html',
      controller: 'ProjectNavController'
    })
    .state('project.list', {
      url: '/list',
      views: {
        'menuContent': {
          templateUrl: 'js/projects/views/list.html',
          controller: 'ProjectListController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('project.item', {
      url: '/item/:id',
      views: {
        'menuContent': {
          templateUrl: 'js/projects/views/item.html',
          controller: 'ProjectItemController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    });
});

angular.module('projects').run(function($rootScope, transit, authService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      authService.logout();
      transit.go('account.login');
    }
  });
});

