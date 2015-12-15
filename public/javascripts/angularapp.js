angular.module('wlmoniter',[
  'ngCookies',
  'ngResource',
  'ui.router',
  'common.accounts',
  'wlmoniter.orders'
]);

angular.module('wlmoniter').run(['$state', function($state) {
//  $state.go('login');
  $state.go('allOrders');
}]);
