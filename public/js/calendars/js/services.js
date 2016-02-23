'use strict'

angular.module('calendars.services', []);
angular.module('calendars.services').factory('Calendar', function(CALENDAR_CALENDAR_ENDPOINT, HTML_ENDPOINT, $resource) {
  return $resource(HTML_ENDPOINT+CALENDAR_CALENDAR_ENDPOINT,
                   {year:'@year'},
                   {stripTrailingSplashes: true});
});
angular.module('calendars.services').value('CALENDAR_CALENDAR_ENDPOINT', '/calendars/calendar/:year');
