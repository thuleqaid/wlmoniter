'use strict'

angular.module('projects.controllers',[]).controller('ProjectNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('projects');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('projects.controllers').controller('ProjectListController', function($scope) {
  $scope.mailsuffix = '1234';
});

