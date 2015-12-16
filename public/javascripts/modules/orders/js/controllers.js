'use strict'

angular.module('wlmoniter.orders.controllers', []).controller('OrderController', ['$scope', 'Order', function($scope, Order) {
  $scope.orders = Order.query();
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderDetailsController', ['$stateParams', '$state', '$scope', 'Order', 'authService', function($stateParams, $state, $scope, Order, authService) {
  $scope.closeOrder = function() {
    $state.go('allOrders');
  };
  $scope.updateOrder = function() {
    $scope.buttonText = "更新中...";
    $scope.order.$update(function() {
      $state.go('allOrders');
    });
  };
  $scope.buttonText = "更新";
  $scope.order = Order.get({id:$stateParams.id});
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderCreateController', ['$stateParams', '$state', '$scope', 'Order', 'authService', function($stateParams, $state, $scope, Order, authService) {
  $scope.closeOrder = function() {
    $state.go('allOrders');
  };
  $scope.addOrder = function() {
    $scope.buttonText = "書き込み中...";
    $scope.order.$save(function() {
      $state.go('allOrders');
    });
  };
  $scope.buttonText = "追加";
  $scope.order = new Order();
}]);
