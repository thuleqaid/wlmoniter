'use strict'

angular.module('projects.services', []);
angular.module('projects.services').factory('Project', function(PROJECT_PROJECT_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+PROJECT_PROJECT_ENDPOINT,
                   {id:'@_id'},
                   {
                     update: {
                       method: 'PUT'
                     }
                   },
                   {stripTrailingSplashes: true});
});
angular.module('projects.services').value('PROJECT_PROJECT_ENDPOINT', '/projects/project/:id');
