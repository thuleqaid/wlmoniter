'use strict'

angular.module('common.accounts.services', []);
angular.module('common.accounts.services').factory('authService', function(REGISTER_ENDPOINT, LOGIN_ENDPOINT, LOGOUT_ENDPOINT, FORGOTPASSWORD_ENDPOINT, RESETPASSWORD_ENDPOINT, CHANGEPASSWORD_ENDPOINT, HTML_ENDPOINT, persistService, $http, $rootScope) {
  var auth = {};
  auth.register = function(username, password, firstname, lastname) {
    return $http.post(HTML_ENDPOINT+REGISTER_ENDPOINT, {username:username, password:password, firstname:firstname, lastname:lastname}).then(function(response, status) {
    });
  };
  auth.login = function(username, password) {
    return $http.post(HTML_ENDPOINT+LOGIN_ENDPOINT, {username:username, password:password}).then(function(response, status) {
      persistService.set('user', response.data.user);
      persistService.set('token', response.data.token);
      $rootScope.$broadcast('authorize_changed', 'login');
      return response.data.user;
    });
  };
  auth.logout = function() {
    return $http.post(HTML_ENDPOINT+LOGOUT_ENDPOINT, {token:persistService.get('token')}).finally(function(response, status) {
      persistService.remove('user');
      persistService.remove('token');
      $rootScope.$broadcast('authorize_changed', 'logout');
    });
  };
  auth.forgotpassword = function(username, flag_mail) {
    return $http.post(HTML_ENDPOINT+FORGOTPASSWORD_ENDPOINT, {username:username, sendmail:flag_mail}).then(function(response, status) {
      var resetcode = '';
      if (response.status == 200) {
        resetcode = response.data.reset_code;
      }
      return resetcode;
    });
  };
  auth.resetpassword = function(username, password, resetcode) {
    return $http.post(HTML_ENDPOINT+RESETPASSWORD_ENDPOINT, {username:username, password:password, resetcode:resetcode}).then(function(response, status) {
    });
  };
  auth.changepassword = function(oldpassword, newpassword) {
    return $http.post(HTML_ENDPOINT+CHANGEPASSWORD_ENDPOINT, {oldpassword:oldpassword, newpassword:newpassword}).then(function(response, status) {
    });
  };
  return auth;
});

angular.module('common.accounts.services').factory('tokenInterceptor',function($q, persistService) {
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
});
angular.module('common.accounts.services').config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('tokenInterceptor');
}]);

angular.module('common.accounts.services').factory('User', function(USER_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+USER_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
});

angular.module('common.accounts.services').factory('ApplyUser', function(APPLY_ENDPOINT, HTML_ENDPOINT, $http) {
  var apply = {};
  apply.query = function() {
    return $http.get(HTML_ENDPOINT+APPLY_ENDPOINT);
  };
  apply.allow = function(appid) {
    return $http.post(HTML_ENDPOINT+APPLY_ENDPOINT, {appid:appid, action:'allow'});
  };
  apply.deny = function(appid) {
    return $http.post(HTML_ENDPOINT+APPLY_ENDPOINT, {appid:appid, action:'deny'});
  };
  return apply;
});

angular.module('common.accounts.services').value('MAIL_SUFFIX', '@kotei-info.com');
angular.module('common.accounts.services').value('APPLY_ENDPOINT', '/users/apply');
angular.module('common.accounts.services').value('USER_ENDPOINT', '/users/api/:id');
angular.module('common.accounts.services').value('REGISTER_ENDPOINT', '/users/register');
angular.module('common.accounts.services').value('LOGIN_ENDPOINT', '/users/login');
angular.module('common.accounts.services').value('LOGOUT_ENDPOINT', '/users/logout');
angular.module('common.accounts.services').value('FORGOTPASSWORD_ENDPOINT', '/users/forgotpassword');
angular.module('common.accounts.services').value('RESETPASSWORD_ENDPOINT', '/users/resetpassword');
angular.module('common.accounts.services').value('CHANGEPASSWORD_ENDPOINT', '/users/changepassword');

