// Ionic Starter App

angular.module('starter', ['ionic', 'common.accounts'])
  .factory('transit', function($state, $ionicHistory) {
    var transit = {};
    transit.goHome = function() {
      $ionicHistory.nextViewOptions({
        disableAnimate: false,
        disableBack: true,
        historyRoot: true
      });
      $state.go('app.search');
    };
    transit.goBack = function() {
      var history = $ionicHistory.viewHistory();
      if (history.backView) {
        $ionicHistory.goBack();
      } else {
        transit.goHome();
      }
    };
    return transit;
  })
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  });

