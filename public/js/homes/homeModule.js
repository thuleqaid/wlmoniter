angular.module('homes', [
  'ionic',
  'homes.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'js/homes/views/index.html',
      controller: 'HomeController'
    });
  $urlRouterProvider.otherwise('/home');
});
