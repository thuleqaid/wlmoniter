'use strict'

angular.module('common.accounts.filters',[]).filter('stripMail', function() {
  return function(email) {
    return email.substr(0, email.lastIndexOf('@'));
  }
});

