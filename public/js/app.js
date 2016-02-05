// Ionic Starter App

angular.module('starter', ['ionic', 'pascalprecht.translate', 'common.accounts', 'homes', 'projects', 'crms', 'finances', 'calendars']);
angular.module('starter').factory('transit', function($state, $ionicHistory) {
  var transit = {};
  transit.go = function(statename) {
    $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: true,
      historyRoot: true
    });
    $state.go(statename);
  };
  transit.goHome = function() {
    transit.go('home');
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
});
angular.module('starter').factory('socket', function($rootScope, WEBSOCKET_ENDPOINT) {
  var socket = io(WEBSOCKET_ENDPOINT);
  return {
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});
angular.module('starter').factory('persistService', function() {
  var persist = {};
  persist.set = function(key, value) {
    if (window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };
  persist.get = function(key) {
    var value = '';
    if (!value) {
      if (window.localStorage) {
        value = JSON.parse(window.localStorage.getItem(key));
      }
    }
    return value;
  };
  persist.remove = function(key) {
    if (window.localStorage) {
      window.localStorage.removeItem(key);
    }
  };
  return persist;
});
angular.module('starter').config(function($translateProvider) {
  var lang = JSON.parse(window.localStorage.getItem('lang')) || 'en';
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: 'i18n/{part}/{lang}.json'
  });
  $translateProvider.useSanitizeValueStrategy('escape');
  $translateProvider.preferredLanguage(lang);
});
angular.module('starter').run(function($ionicPlatform, $rootScope, $translate) {
  $rootScope.$on('$translatePartialLoaderStructureChanged', function() {
    $translate.refresh();
  });
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

angular.module('starter').value('HTML_ENDPOINT', 'http://192.168.60.32:5000');
angular.module('starter').value('WEBSOCKET_ENDPOINT', 'http://192.168.60.32:4000');

