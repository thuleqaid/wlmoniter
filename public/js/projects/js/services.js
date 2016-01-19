'use strict'

angular.module('projects.services', []);
angular.module('projects.services').factory('projectService', function() {
  return {
    projects: [
      {
        '_id':      '12340001',
        'customer': 'Elesys',
        'name_c':   'Elesys project1',
        'name_k':   'Kotei project1'
      },
      {
        '_id':      '12340002',
        'customer': 'Elesys',
        'name_c':   'Elesys project2',
        'name_k':   'Kotei project2'
      },
    ],
    getProject: function(id) {
      for (var i in this.projects) {
        if (this.projects[i]._id == id) {
          return this.projects[i];
        }
      }
    }
  };
});

