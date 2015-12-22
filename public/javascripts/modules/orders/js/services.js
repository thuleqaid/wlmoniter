'use strict'

angular.module('wlmoniter.orders.services',[]).factory('Order', ['ORDER_ENDPOINT', 'HTML_ENDPOINT', '$resource', function(ORDER_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+ORDER_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
}]);

angular.module('wlmoniter.orders.services').value('ORDER_ENDPOINT', '/orders/:id');
