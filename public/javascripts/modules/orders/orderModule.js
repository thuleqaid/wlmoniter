angular.module('wlmoniter.orders', [
        'wlmoniter.orders.services',
        'wlmoniter.orders.controllers',
        'ui.router'
        ]);
angular.module('wlmoniter.orders').config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
    $stateProvider.state('allOrders', {
      url: '/orders',
      templateUrl: 'javascripts/modules/orders/views/orders.html',
      controller: 'OrderController',
      resolve:{
        user:['authService', '$q', function(authService, $q) {
          return authService.user || $q.reject({unAuthorized:true});
        }]
      }
    });
    $stateProvider.state('singleOrder', {
        url: '/orders/:id',
        templateUrl: 'javascripts/modules/orders/views/singleOrder.html',
        controller: 'OrderDetailsController'
    });
    //$locationProvider.html5Mode(true);
}]);
