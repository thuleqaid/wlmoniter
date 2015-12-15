'use strict'

angular.module('common.accounts.services', ['ngCookies']).factory('authService', ['LOGIN_ENDPOINT', 'LOGOUT_ENDPOINT', '$http', '$cookieStore', '$rootScope', function(LOGIN_ENDPOINT, LOGOUT_ENDPOINT, $http, $cookieStore, $rootScope) {
  var auth = {};
  auth.login = function(username, password) {
    return $http.post(LOGIN_ENDPOINT, {username:username, password:password}).then(function(response, status) {
      if(window.localStorage){
        window.localStorage.setItem('user', JSON.stringify(response.data.user));
        window.localStorage.setItem('expires', response.data.expires);
        window.localStorage.setItem('token', response.data.token);
      }
      auth.user = response.data.user;
      auth.token = response.data.token;
      $cookieStore.put('user', auth.user);
      $cookieStore.put('token', auth.token);
      $rootScope.$broadcast('authorize_changed', 'login');
      return auth.user;
    });
  };
  auth.logout = function() {
    return $http.post(LOGOUT_ENDPOINT, {userid:auth.user.userid, token:auth.token}).then(function(response, status) {
      if(window.localStorage){
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('expires');
        window.localStorage.removeItem('token');
      }
      auth.user = undefined;
      auth.token = undefined;
      $cookieStore.remove('user');
      $cookieStore.remove('token');
      $rootScope.$broadcast('authorize_changed', 'logout');
    });
  };
  return auth;
}]);

angular.module('common.accounts.services').factory('tokenInterceptor',['$q', '$cookieStore', function($q, $cookieStore) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      var token = $cookieStore.get('token');
      if (token) {
      } else {
        if(window.localStorage){
          token = window.localStorage.getItem('token');
        }
      }
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

angular.module('common.accounts.services').value('LOGIN_ENDPOINT', 'http://127.0.0.1:5000/users/login');
angular.module('common.accounts.services').value('LOGOUT_ENDPOINT', 'http://127.0.0.1:5000/users/logout');
angular.module('common.accounts.services').value('DEFAULT_ROUTE', 'allOrders');
