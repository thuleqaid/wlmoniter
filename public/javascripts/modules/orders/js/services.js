'use strict'

angular.module('wlmoniter.orders.services',[]).factory('Order', ['ORDER_ENDPOINT', '$resource', function(ORDER_ENDPOINT, $resource) {
  return $resource(ORDER_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
}]);

angular.module('wlmoniter.orders.services').value('ORDER_ENDPOINT', 'http://192.168.60.14:5000/orders/:id');
