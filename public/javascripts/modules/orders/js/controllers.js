'use strict'

angular.module('wlmoniter.orders.controllers', []).controller('OrderController', ['$scope', 'Order', 'User', function($scope, Order, User) {
  $scope.users = User.query();
  $scope.orders = Order.query();
  $scope.username = function(userid) {
    var ret = userid;
    $scope.users.forEach(function(user) {
      if (user._id == userid) {
        ret = user.last_name + ' ' + user.first_name;
      }
    });
    return ret;
  };
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderDetailsController', ['$stateParams', '$state', '$scope', 'Order', 'authService', function($stateParams, $state, $scope, Order, authService) {
  $scope.format = 'yyyy/MM/dd';
  $scope.status = {
    opened_start:false,
    opened_end:false
  };
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
  $scope.open = function(index, $event) {
    if (index == 1) {
      $scope.status.opened_start = true;
    } else if (index == 2) {
      $scope.status.opened_end = true;
    }
  };
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
  $scope.order = Order.get({id:$stateParams.id}, function() {
    $scope.order.date_start = new Date(Date.parse($scope.order.date_start));
    $scope.order.date_end = new Date(Date.parse($scope.order.date_end));
 });
  $scope.order.date_start = new Date(Date.parse($scope.order.date_start));
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderCreateController', ['$stateParams', '$state', '$scope', 'Order', 'authService', function($stateParams, $state, $scope, Order, authService) {
  $scope.format = 'yyyy/MM/dd';
  $scope.status = {
    opened_start:false,
    opened_end:false
  };
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
  $scope.open = function(index, $event) {
    if (index == 1) {
      $scope.status.opened_start = true;
    } else if (index == 2) {
      $scope.status.opened_end = true;
    }
  };
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
  $scope.order.valid = true;
  $scope.order.nda = true;
}]);
