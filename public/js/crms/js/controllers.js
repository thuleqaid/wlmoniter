'use strict'

angular.module('crms.controllers',[]).controller('CRMNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('crms');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('crms.controllers').controller('CRMCompanyListController', function($scope, Company) {
  var refreshData = function() {
    $scope.companies = Company.query();
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
});
angular.module('crms.controllers').controller('CRMCustomerListController', function($scope, Customer) {
  var refreshData = function() {
    $scope.customers = Customer.query();
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
});
angular.module('crms.controllers').controller('CRMCompanyProfileController', function($scope, $stateParams, $timeout, transit, persistService, Company, Customer) {
  var refreshData = function() {
    $scope.invalidProfile = false;
    $scope.finishProfile = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-balanced';
    var user = persistService.get('user');
    $scope.company = Company.get({id:$stateParams.id}, function() { });
    $scope.permission = {
      'modify': (user && user.permission.indexOf('modify') >= 0),
      'create': (user && user.permission.indexOf('create') >= 0),
      'admin': (user && user.permission.indexOf('admin') >= 0)
    };
    $scope.customers = Customer.query();
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.doUpdate = function() {
    $scope.company.$update(function() {
      $scope.invalidProfile = false;
      $scope.finishProfile = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        transit.goBack();
      }, 1000);
    },function(err) {
      $scope.invalidProfile = true;
      $scope.finishProfile = false;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    });
  };
});
angular.module('crms.controllers').controller('CRMCustomerProfileController', function($scope, $stateParams, $timeout, transit, persistService, Customer) {
  var refreshData = function() {
    $scope.invalidProfile = false;
    $scope.finishProfile = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-balanced';
    var user = persistService.get('user');
    $scope.customer = Customer.get({id:$stateParams.id}, function() { });
    $scope.permission = {
      'modify': (user && user.permission.indexOf('modify') >= 0),
      'create': (user && user.permission.indexOf('create') >= 0),
      'admin': (user && user.permission.indexOf('admin') >= 0)
    };
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.doUpdate = function() {
    $scope.customer.$update(function() {
      $scope.invalidProfile = false;
      $scope.finishProfile = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        transit.goBack();
      }, 1000);
    },function(err) {
      $scope.invalidProfile = true;
      $scope.finishProfile = false;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    });
  };
});
