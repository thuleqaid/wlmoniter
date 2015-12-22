'use strict'

angular.module('wlmoniter.orders.controllers', []).controller('OrderController', ['$scope', 'Order', 'User', 'persistService', 'socket', function($scope, Order, User, persistService, socket) {
  var refreshData = function() {
    $scope.users = User.query();
    Order.query().$promise.then(function(data) {
      $scope.orders = data;
    },function(err) {
      console.log(err);
    });
  };
  socket.on('table-order', refreshData);
  refreshData();
  $scope.username = function(userid) {
    var ret = userid;
    $scope.users.forEach(function(user) {
      if (user._id == userid) {
        ret = user.last_name + ' ' + user.first_name;
      }
    });
    return ret;
  };
  $scope.permission = {
    'modify': (persistService.get('user').permission.indexOf('modify') >= 0),
    'create': (persistService.get('user').permission.indexOf('create') >= 0),
    'admin': (persistService.get('user').permission.indexOf('admin') >= 0)
  };
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderDetailsController', ['$stateParams', '$state', '$scope', 'Order', 'persistService', function($stateParams, $state, $scope, Order, persistService) {
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
  $scope.permission = {
    'modify': (persistService.get('user').permission.indexOf('modify') >= 0),
    'create': (persistService.get('user').permission.indexOf('create') >= 0),
    'admin': (persistService.get('user').permission.indexOf('admin') >= 0)
  };
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderCreateController', ['$stateParams', '$state', '$scope', 'Order', 'persistService', function($stateParams, $state, $scope, Order, persistService) {
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
  $scope.permission = {
    'modify': (persistService.get('user').permission.indexOf('modify') >= 0),
    'create': (persistService.get('user').permission.indexOf('create') >= 0),
    'admin': (persistService.get('user').permission.indexOf('admin') >= 0)
  };
}]);
