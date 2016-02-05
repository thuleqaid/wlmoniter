'use strict'

angular.module('finances.controllers',[]).controller('FinanceNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('finances');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('finances.controllers').controller('FinanceOverviewController', function($scope) {
  var refreshData = function() {
    $scope.current = {
      'sales_target': 6000000,
      'sales_amount': 500000
    };
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
});
