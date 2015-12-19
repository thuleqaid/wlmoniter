'use strict'

angular.module('common.accounts.services', ['ngCookies']);
angular.module('common.accounts.services').factory('persistService', ['$cookieStore', function($cookieStore) {
  var persist = {};
  persist.set = function(key, value) {
    $cookieStore.put(key, value);
    if (window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };
  persist.get = function(key) {
    var value = $cookieStore.get(key);
    if (!value) {
      if (window.localStorage) {
        value = JSON.parse(window.localStorage.getItem(key));
      }
    }
    return value;
  };
  persist.remove = function(key) {
    $cookieStore.remove(key);
    if (window.localStorage) {
      window.localStorage.removeItem(key);
    }
  };
  return persist;
}]);
angular.module('common.accounts.services').factory('authService', ['REGISTER_ENDPOINT', 'LOGIN_ENDPOINT', 'LOGOUT_ENDPOINT', 'FORGOTPASSWORD_ENDPOINT', 'RESETPASSWORD_ENDPOINT', 'persistService', '$http', '$rootScope', function(REGISTER_ENDPOINT, LOGIN_ENDPOINT, LOGOUT_ENDPOINT, FORGOTPASSWORD_ENDPOINT, RESETPASSWORD_ENDPOINT, persistService, $http, $rootScope) {
  var auth = {};
  auth.register = function(username, password, firstname, lastname) {
    return $http.post(REGISTER_ENDPOINT, {username:username, password:password, firstname:firstname, lastname:lastname}).then(function(response, status) {
    });
  };
  auth.login = function(username, password) {
    return $http.post(LOGIN_ENDPOINT, {username:username, password:password}).then(function(response, status) {
      auth.user = response.data.user;
      auth.token = response.data.token;
      persistService.set('user', auth.user);
      persistService.set('token', auth.token);
      $rootScope.$broadcast('authorize_changed', 'login');
      return auth.user;
    });
  };
  auth.logout = function() {
    return $http.post(LOGOUT_ENDPOINT, {token:auth.token}).finally(function(response, status) {
      auth.user = undefined;
      auth.token = undefined;
      persistService.remove('user');
      persistService.remove('token');
      $rootScope.$broadcast('authorize_changed', 'logout');
    });
  };
  auth.forgotpassword = function(username) {
    return $http.post(FORGOTPASSWORD_ENDPOINT, {username:username}).then(function(response, status) {
    });
  };
  auth.resetpassword = function(username, password, resetcode) {
    return $http.post(RESETPASSWORD_ENDPOINT, {username:username, password:password, resetcode:resetcode}).then(function(response, status) {
    });
  };
  return auth;
}]);

angular.module('common.accounts.services').factory('tokenInterceptor',['$q', 'persistService', function($q, persistService) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      var token = persistService.get('token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    },
    response: function(response) {
      return response || $q.when(response);
    }
  };
}]);
angular.module('common.accounts.services').config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('tokenInterceptor');
}]);

angular.module('common.accounts.services').factory('User', ['USER_ENDPOINT', '$resource', function(USER_ENDPOINT, $resource) {
  return $resource(USER_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
}]);

angular.module('common.accounts.services').factory('ApplyUser', ['APPLY_ENDPOINT', '$http', function(APPLY_ENDPOINT, $http) {
  var apply = {};
  apply.query = function() {
    return $http.get(APPLY_ENDPOINT);
  };
  apply.allow = function(appid) {
    return $http.post(APPLY_ENDPOINT, {appid:appid, action:'allow'});
  };
  apply.deny = function(appid) {
    return $http.post(APPLY_ENDPOINT, {appid:appid, action:'deny'});
  };
  return apply;
}]);

angular.module('common.accounts.services').value('MAIL_SUFFIX', '@163.com');
angular.module('common.accounts.services').value('APPLY_ENDPOINT', 'http://127.0.0.1:5000/users/apply');
angular.module('common.accounts.services').value('USER_ENDPOINT', 'http://127.0.0.1:5000/users/api/:id');
angular.module('common.accounts.services').value('REGISTER_ENDPOINT', 'http://127.0.0.1:5000/users/register');
angular.module('common.accounts.services').value('LOGIN_ENDPOINT', 'http://127.0.0.1:5000/users/login');
angular.module('common.accounts.services').value('LOGOUT_ENDPOINT', 'http://127.0.0.1:5000/users/logout');
angular.module('common.accounts.services').value('FORGOTPASSWORD_ENDPOINT', 'http://127.0.0.1:5000/users/forgotpassword');
angular.module('common.accounts.services').value('RESETPASSWORD_ENDPOINT', 'http://127.0.0.1:5000/users/resetpassword');
angular.module('common.accounts.services').value('DEFAULT_ROUTE', 'allOrders');
