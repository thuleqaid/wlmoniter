'use strict'

angular.module('common.accounts.filters',[]).filter('stripMail', function() {
  return function(email) {
    return email.substr(0, email.lastIndexOf('@'));
  }
});
angular.module('common.accounts.filters').filter('fullname', function() {
  return function(record, sep) {
    var ret = record.last_name;
    if (record.first_name) {
      ret += sep + record.first_name;
    }
    return ret;
  }
});

