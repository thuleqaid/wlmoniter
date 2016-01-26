'use strict'

angular.module('projects.filters',[]).filter('name_member', function() {
  return function(idarray, users) {
    var ret = [];
    if (Object.prototype.toString.call(idarray) === '[object Array]') {
      ret = idarray.slice(0);
    } else {
      ret.push(idarray);
    }
    if (users) {
      users.forEach(function(user) {
        if (ret.indexOf(user._id) >= 0) {
          ret[ret.indexOf(user._id)] = user.last_name + user.first_name;
        }
      });
    }
    return ret.join(", ");
  }
});
