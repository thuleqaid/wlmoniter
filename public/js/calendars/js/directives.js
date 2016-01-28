'use strict'

angular.module('calendars.directives',[]).directive('calendar', function() {
  return {
    restrict: 'E',
    scope: {
    },
    repalce: true,
    templateUrl: 'js/calendars/views/d_calendar.html',
    link: function(scope, elem, attrs) {
      scope.color_workday = 'button-light';
      scope.color_holiday = 'button-assertive';
      scope.color_studyday = 'button-energized';

      scope.workday = eval(attrs['workday'] || []);
      scope.holiday = eval(attrs['holiday'] || []);
      scope.studyday = eval(attrs['studyday'] || []);
      scope.year = attrs['year'] || 2016;
      scope.month = attrs['month'] || 1;
      if (attrs['startDay'] && attrs['startDay'] == 'Mon') {
        scope.startday = 1;
        scope.weektitle = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      } else {
        scope.startday = 0;
        scope.weektitle = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      }
      var startday = new Date(scope.year, scope.month - 1, 1).getDay();
      var endday = new Date(scope.year, scope.month, 0).getDate();

      scope.weeks = [];
      scope.weeks.push([{class:scope.color_workday,value:''},
                        {class:scope.color_workday,value:''},
                        {class:scope.color_workday,value:''},
                        {class:scope.color_workday,value:''},
                        {class:scope.color_workday,value:''},
                        {class:scope.color_workday,value:''},
                        {class:scope.color_workday,value:''}]);
      for (var i = 0; i < endday; i++) {
        var curday = (startday + i) % 7;
        if (i == 0) {
        } else {
          if (curday == scope.startday) {
            scope.weeks.push([{class:scope.color_workday,value:''},
                              {class:scope.color_workday,value:''},
                              {class:scope.color_workday,value:''},
                              {class:scope.color_workday,value:''},
                              {class:scope.color_workday,value:''},
                              {class:scope.color_workday,value:''},
                              {class:scope.color_workday,value:''}]);
          }
        }
        scope.weeks[scope.weeks.length - 1][(curday + 7 - scope.startday) % 7].value = i+1;
        if (curday == 0 || curday == 6) {
          scope.weeks[scope.weeks.length - 1][(curday + 7 - scope.startday) % 7].class = scope.color_holiday;
        }
        if (scope.workday.indexOf(i+1) >= 0) {
          scope.weeks[scope.weeks.length - 1][(curday + 7 - scope.startday) % 7].class = scope.color_workday;
        } else if (scope.holiday.indexOf(i+1) >= 0) {
          scope.weeks[scope.weeks.length - 1][(curday + 7 - scope.startday) % 7].class = scope.color_holiday;
        } else if (scope.studyday.indexOf(i+1) >= 0) {
          scope.weeks[scope.weeks.length - 1][(curday + 7 - scope.startday) % 7].class = scope.color_studyday;
        }
      }

      scope.showAttrs = function() {
        console.log(attrs);
      };
    }
  };
});
