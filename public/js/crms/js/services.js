'use strict'

angular.module('crms.services', []);
angular.module('crms.services').factory('Company', function(CRM_COMPANY_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+CRM_COMPANY_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
});
angular.module('crms.services').factory('Customer', function(CRM_CUSTOMER_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+CRM_CUSTOMER_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
});
angular.module('crms.services').value('CRM_COMPANY_ENDPOINT', '/crms/company/:id');
angular.module('crms.services').value('CRM_CUSTOMER_ENDPOINT', '/crms/customer/:id');
