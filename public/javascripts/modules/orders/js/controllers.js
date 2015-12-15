'use strict'

angular.module('wlmoniter.orders.controllers', []).controller('OrderController', ['$scope', '$cookieStore', 'orderService', 'Order', function($scope, $cookieStore, orderService, Order) {
    $scope.getAllOrders = function() {
        return orderService.getAll();
    };
    $scope.label_nda = function(idx) {
        return orderService.getNdaStatusByIdx(idx);
    };
    $scope.label_contract = function(idx) {
        return orderService.getNdaStatusByIdx(idx);
    };
    $scope.orders = $scope.getAllOrders();
  // $scope.orders_test = Order.query();
  $scope.user = $cookieStore.get('user');
}]);
angular.module('wlmoniter.orders.controllers').controller('OrderDetailsController', ['$stateParams', '$state', '$scope', '$uibModal', 'orderService', function($stateParams, $state, $scope, $uibModal, orderService) {
    $scope.open = function(email_type) {
        var modalInstance = $uibModal.open( {
            templateUrl: 'email_chooser.html',
            controller: 'ModalInstanceController',
            resolve: {
                email_type: email_type,
                emails: function() {
                    if (email_type === 1) {
                        return $scope.order.follow_email[$scope.settingidx];
                    } else {
                        return $scope.order.notify_email[$scope.settingidx];
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            if (data.email_type === 1) {
                $scope.order.follow_email[$scope.settingidx] = data.emails;
            } else {
                $scope.order.notify_email[$scope.settingidx] = data.emails;
            }
        }, function() {
        });
    };
    $scope.getOrderById = function(id) {
        return orderService.getOrderById(id);
    };
    $scope.closeOrder = function() {
        $state.go('allOrders');
    };
    $scope.updateOrder = function() {
        $scope.buttonText = "更新中...";
        orderService.updateOrder($scope.order);
        $state.go('allOrders')
    };
    $scope.buttonText = "更新";
    $scope.order = JSON.parse(JSON.stringify($scope.getOrderById($stateParams.id)));

    $scope.ndas = (function() {
        var x = new Array();
        var idx = 0;
        var ndalabels = orderService.getNdaStatus()
        for (var idx = 0; idx < ndalabels.length; idx++) {
            x[idx] = {id:idx, label:ndalabels[idx]}
        }
        return x;
    })();
    $scope.contracts = (function() {
        var x = new Array();
        var idx = 0;
        var contractlabels = orderService.getContractStatus()
        for (var idx = 0; idx < contractlabels.length; idx++) {
            x[idx] = {id:idx, label:contractlabels[idx]}
        }
        return x;
    })();
    $scope.settingidx = 0;
}]);
angular.module('wlmoniter.orders.controllers').controller('ModalInstanceController', function($scope, $uibModalInstance, email_type, emails) {
    $scope.email_type = email_type;
    $scope.emails = emails;
    $scope.ok = function() {
        $uibModalInstance.close({'email_type':$scope.email_type, 'emails':$scope.emails});
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});
