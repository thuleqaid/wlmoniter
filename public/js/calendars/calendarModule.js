angular.module('calendars', [
  'ionic',
  'calendars.directives'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('cal', {
    url: '/cal',
    templateUrl: 'js/calendars/views/test.html',
  })
});