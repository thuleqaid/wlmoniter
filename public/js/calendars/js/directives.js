'use strict'

/* HTML Example
<calendar data-mode="view"      <!-- simple/view/edit -->
          data-start-day="Sun"  <!-- Sun/Mon -->
          data-year="2016"      <!-- 起始月份的年 -->
          data-month="1"        <!-- 起始月份的月 -->
          data-columns="2"      <!-- 一行显示几个月（根据下面3个2维数组决定一共显示几个月） -->
          data-holiday="[[1],[8,9,10,11,12],[]]"  <!-- 每个月的额外休假 -->
          data-studyday="[[30],[],[26]]"          <!-- 每个月的管理培训日 -->
          data-workday="[[],[],[]]">              <!-- 每个月的额外工作日 -->
</calendar>
 */

angular.module('calendars.directives',[]).directive('calendar', function() {
  return {
    restrict: 'E',
    scope: {
    },
    repalce: true,
    templateUrl: 'js/calendars/views/d_calendar.html',
    link: function(scope, elem, attrs) {
      /* 设置工作日、休假和管理培训日的颜色 */
      var color_workday = 'button-light';
      var color_holiday = 'button-assertive';
      var color_studyday = 'button-energized';

      /* 设置星期标题 */
      var weekstart = 0;
      if (attrs['startDay'] && attrs['startDay'] == 'Mon') {
        weekstart = 1;
        scope.weektitle = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      } else {
        scope.weektitle = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      }

      var workday = eval(attrs['workday'] || [[]]);
      var holiday = eval(attrs['holiday'] || [[]]);
      var studyday = eval(attrs['studyday'] || [[]]);
      var colcnt = attrs['columns'] || 1;
      var monthcnt = Math.max(workday.length, holiday.length, studyday.length);
      var year = eval(attrs['year'] || 2016);
      var month = eval(attrs['month'] || 1);
      colcnt = Math.min(colcnt, monthcnt);  // 月份个数小于列数时，减小列数

      /* 日历输出数组 */
      /* 第一层子元素表示一行，是一个数组 */
      /* 第二层子元素表示一个单元格（即一个月份） */
      /* 第二层子元素是一个object，有3个成员：年、月、星期数据 */
      /* 星期数据是一个2维数据（[n][7]），星期数据[i][j]表示该月日历上第i+1行第j+1列的数据 */
      scope.cal = [];
      for (var mi = 0; mi < monthcnt; mi++) {
        var weeks = [];
        var startday = new Date(year, month - 1, 1).getDay();  // 当前月的第一天
        var endday = new Date(year, month, 0).getDate();       // 当前月的最后一天
        var cur_workday = workday[mi] || [];                   // 当前月的额外工作日（周一到周五以外）
        var cur_holiday = holiday[mi] || [];                   // 当前月的额外休假（周六和周日以外）
        var cur_studyday = studyday[mi] || [];                 // 当前月的管理培训日
        weeks.push([{class:color_workday,value:''},
                    {class:color_workday,value:''},
                    {class:color_workday,value:''},
                    {class:color_workday,value:''},
                    {class:color_workday,value:''},
                    {class:color_workday,value:''},
                    {class:color_workday,value:''}]);
        for (var i = 0; i < endday; i++) {
          var curday = (startday + i) % 7;
          if (i == 0) {
          } else {
            if (curday == weekstart) {
              weeks.push([{class:color_workday,value:''},
                          {class:color_workday,value:''},
                          {class:color_workday,value:''},
                          {class:color_workday,value:''},
                          {class:color_workday,value:''},
                          {class:color_workday,value:''},
                          {class:color_workday,value:''}]);
            }
          }
          /* 设置日期 */
          weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].value = i+1;
          /* 设置普通工作日和休假的颜色 */
          if (curday == 0 || curday == 6) {
            weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].class = color_holiday;
          }
          /* 根据用户指定情报设置额外工作日、休假和管理培训日的颜色 */
          if (cur_workday.indexOf(i+1) >= 0) {
            weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].class = color_workday;
          } else if (cur_holiday.indexOf(i+1) >= 0) {
            weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].class = color_holiday;
          } else if (cur_studyday.indexOf(i+1) >= 0) {
            weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].class = color_studyday;
          }
        }
        /* 设置scope.cal */
        if (mi % colcnt == 0) {
          scope.cal.push([]);
          for (var ci = 0; ci < colcnt; ci++) {
            scope.cal[scope.cal.length-1].push({});
          }
        }
        scope.cal[scope.cal.length-1][mi % colcnt]['year']=year;
        scope.cal[scope.cal.length-1][mi % colcnt]['month']=month;
        scope.cal[scope.cal.length-1][mi % colcnt]['weeks']=weeks;
        /* 更新月份 */
        month += 1;
        if (month > 12) {
          year += 1;
          month -= 12;
        }
      }
      /* 设置显示模式 */
      if (attrs['mode'] == 'edit') {
        scope.calmode = 'edit';
      } else if (attrs['mode'] == 'view'){
        scope.calmode = 'view';
      } else {
        scope.calmode = 'simple';
      }
      /* 点击事件处理函数 */
      scope.click = function(year, month, day) {
        if (day.value) {
          console.log(year, month, day);
        }
      };
    }
  };
});
