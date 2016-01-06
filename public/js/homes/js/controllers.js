'use strict'

angular.module('homes.controllers',[]).controller('HomeController', function($scope, $ionicModal, $translatePartialLoader, $translate, transit, persistService) {
  $translatePartialLoader.addPart('homes');
  $scope.jump = function(statename) {
    transit.go(statename);
  };
  $scope.switchLang = function(lang) {
    persistService.set('lang', lang);
    $translate.use(lang);
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('js/homes/views/settings.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSetting = modal;
  });
  // Triggered in the login modal to close it
  $scope.closeSetting = function() {
    $scope.modalSetting.hide();
  };
  // Open the login modal
  $scope.setting = function() {
    $scope.settingData = { };
    $scope.settingData.lang = persistService.get('lang');
    $scope.modalSetting.show();
  };
  // Perform the login action when the user submits the login form
  $scope.doSetting = function() {
    $scope.switchLang($scope.settingData.lang);
    $scope.closeSetting();
  };
});
