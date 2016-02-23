'use strict'

angular.module('calendars.controllers',[]).controller('CalendarNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('calendars');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('calendars.controllers').controller('CalendarCalendarController', function($scope, Calendar) {
  var refreshData = function() {
    $scope.current = {
      'year': (new Date()).getFullYear(),
      'info': {'counter':0}
    };
    Calendar.get({year:$scope.current.year}).$promise.then(function(info) {
      var counter = $scope.current.info.counter + 1;
      $scope.current.info = info;
      $scope.current.info.counter = counter;
    });
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.$on('CALENDAR_CELL_CLICK', function(event, data) {
    console.log(data);
  });
  $scope.stepYear = function(delta) {
    if (delta == 0) {
      $scope.current.year = (new Date()).getFullYear();
    } else {
      $scope.current.year = $scope.current.year + delta;
    }
    Calendar.get({year:$scope.current.year}).$promise.then(function(info) {
      var counter = $scope.current.info.counter + 1;
      $scope.current.info = info;
      $scope.current.info.counter = counter;
    });
  };
});
