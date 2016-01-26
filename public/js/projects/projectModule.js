angular.module('projects', [
  'ionic',
  'ngResource',
  // 'projects.directives',
  'projects.filters',
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
    .state('project.projects', {
      url: '/projects',
      views: {
        'menuContent': {
          templateUrl: 'js/projects/views/projects.html',
          controller: 'ProjectProjectListController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('project.project', {
      url: '/projectprofile/:id',
      views: {
        'menuContent': {
          templateUrl: 'js/projects/views/project.html',
          controller: 'ProjectProjectProfileController'
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

