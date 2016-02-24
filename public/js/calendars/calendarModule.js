angular.module('calendars', [
  'ionic',
  'calendars.directives',
  'calendars.services',
  'calendars.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('calendar', {
      url: '/calendar',
      abstract: true,
      templateUrl: 'js/calendars/views/menu.html',
      controller: 'CalendarNavController'
    })
    .state('calendar.calendar', {
      url: '/calendar',
      views: {
        'menuContent': {
          templateUrl: 'js/calendars/views/calendar.html',
          controller: 'CalendarCalendarController'
        }
      }
    })
    .state('calendar.workload', {
      url: '/workload',
      views: {
        'menuContent': {
          templateUrl: 'js/calendars/views/workload.html',
          controller: 'CalendarWorkloadController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    });
});

angular.module('calendars').run(function($rootScope, transit, authService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      authService.logout();
      transit.go('account.login');
    }
  });
});
