'use strict'

angular.module('projects.controllers',[]).controller('ProjectNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('projects');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('projects.controllers').controller('ProjectListController', function($scope, projectService) {
  $scope.projects = projectService.projects;
});

angular.module('projects.controllers').controller('ProjectItemController', function($scope, $stateParams, projectService) {
  $scope.project = projectService.getProject($stateParams.id);
});

