'use strict'

angular.module('wlmoniter.orders.filters',[]).filter('contractStatus', function() {
  return function(status) {
    return status?'サイン済み':'未サイン';
  }
});
