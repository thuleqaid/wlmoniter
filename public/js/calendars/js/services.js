'use strict'

angular.module('calendars.services', []);
angular.module('calendars.services').factory('Calendar', function(CALENDAR_CALENDAR_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+CALENDAR_CALENDAR_ENDPOINT,
                   {year:'@year'},
                   {stripTrailingSplashes: true});
});
angular.module('calendars.services').factory('Workload', function(CALENDAR_WORKLOAD_ENDPOINT, HTML_ENDPOINT, $http) {
  var workload = {};
  workload.workload = function(year, month) {
    return $http.post(HTML_ENDPOINT+CALENDAR_WORKLOAD_ENDPOINT,
                      {year:year,month:month}).then(function(response, status) {
                        return response.data;
                      });
  };
  return workload;
});
angular.module('calendars.services').value('CALENDAR_CALENDAR_ENDPOINT', '/calendars/calendar/:year');
angular.module('calendars.services').value('CALENDAR_WORKLOAD_ENDPOINT', '/calendars/workload/');
