'use strict'

/* HTML Example
<calendar data-mode="view"      <!-- simple/view/edit -->
          data-start-day="Sun"  <!-- Sun/Mon -->
          data-year="2016"      <!-- 起始月份的年 -->
          data-month="1"        <!-- 起始月份的月 -->
          data-columns="2"      <!-- 一行显示几个月（根据下面3个2维数组决定一共显示几个月） -->
          data-info="{holiday:[[1],[8,9,10,11,12],[]], studyday:[[30],[],[26]], workday:[[],[],[]]}"
                                <!-- 每个月的额外休假 -->
                                <!-- 每个月的管理培训日 -->
                                <!-- 每个月的额外工作日 -->
          >
</calendar>
 */

angular.module('calendars.directives',[]).directive('calendar', function() {
  return {
    restrict: 'E',
    scope: {
      info:'@',
      year:'@',
      month:'@',
      extra:'@'
    },
    repalce: true,
    templateUrl: 'js/calendars/views/d_calendar.html',
    link: function(scope, elem, attrs) {
      var drawViewCalendar = function() {
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

        var info = JSON.parse(attrs['info']);
        var extra = JSON.parse(attrs['extra'] || "{}");
        var workday = info.workday || [[]];
        var holiday = info.holiday || [[]];
        var studyday = info.studyday || [[]];
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
          weeks.push([{class:color_workday,value:'',cell:[],inner:[]},
                      {class:color_workday,value:'',cell:[],inner:[]},
                      {class:color_workday,value:'',cell:[],inner:[]},
                      {class:color_workday,value:'',cell:[],inner:[]},
                      {class:color_workday,value:'',cell:[],inner:[]},
                      {class:color_workday,value:'',cell:[],inner:[]},
                      {class:color_workday,value:'',cell:[],inner:[]}]);
          for (var i = 0; i < endday; i++) {
            var curday = (startday + i) % 7;
            if (i == 0) {
            } else {
              if (curday == weekstart) {
                weeks.push([{class:color_workday,value:'',cell:[],inner:[]},
                            {class:color_workday,value:'',cell:[],inner:[]},
                            {class:color_workday,value:'',cell:[],inner:[]},
                            {class:color_workday,value:'',cell:[],inner:[]},
                            {class:color_workday,value:'',cell:[],inner:[]},
                            {class:color_workday,value:'',cell:[],inner:[]},
                            {class:color_workday,value:'',cell:[],inner:[]}]);
              }
            }
            /* 设置日期 */
            weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].value = i+1;
            var tmpdate = new Date(year, month-1, i+1);
            if (extra[tmpdate]) {
              weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].cell.push(extra[tmpdate][0]);
              weeks[weeks.length - 1][(curday + 7 - weekstart) % 7].cell.push(extra[tmpdate][1]);
            }
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
      };
      var findCell = function(year, month, day) {
        for (var i = 0; i < scope.cal.length; i++) {
          for (var j = 0; j < scope.cal[i].length; j++) {
            if (scope.cal[i][j]['year'] == year && scope.cal[i][j]['month'] == month) {
              for (var k = 0; k < scope.cal[i][j]['weeks'].length; k++) {
                for (var l = 0; l < scope.cal[i][j]['weeks'][k].length; l++) {
                  if (scope.cal[i][j]['weeks'][k][l].value == day) {
                    return [i,j,k,l];
                  }
                }
              }
            }
          }
        }
        return [-1, -1, -1, -1];
      };
      /* 点击事件处理函数 */
      scope.click = function(year, month, day) {
        if (day.value) {
          scope.$emit("CALENDAR_CELL_CLICK", new Date(year, month-1, day.value));
        //   /* 点击日期有效 */
        //   if (scope.selectinfo.multiselect) {
        //     /* 复选模式 */
        //     if (scope.selectinfo.lastselect.length <= 0) {
        //       /* 复选模式的第1次点击 */
        //       scope.selectinfo.lastselect = [year, month, day.value];
        //     } else {
        //       /* 复选模式的第2次点击 */
        //       if (year == scope.selectinfo.lastselect[0] && month == scope.selectinfo.lastselect[1] && day.value == scope.selectinfo.lastselect[2]) {
        //         /* 两次点击在同一日期，清除选择记录 */
        //       } else {
        //         scope.selectinfo.lastselect.push(year, month, day.value);
        //         var pos1 = findCell(scope.selectinfo.lastselect[0], scope.selectinfo.lastselect[1], scope.selectinfo.lastselect[2]);
        //         var pos2 = findCell(scope.selectinfo.lastselect[3], scope.selectinfo.lastselect[4], scope.selectinfo.lastselect[5]);
        //         var curpos, stoppos;
        //         if ((((pos1[0] * 100 + pos1[1]) * 100 + pos1[2]) * 100 + pos1[3]) > (((pos2[0] * 100 + pos2[1]) * 100 + pos2[2]) * 100 + pos2[3])) {
        //           curpos = pos2;
        //           stoppos = pos1;
        //         } else {
        //           curpos = pos1;
        //           stoppos = pos2;
        //         }
        //         while (curpos[0] != stoppos[0] || curpos[1] != stoppos[1] || curpos[2] != stoppos[2] || curpos[3] != stoppos[3]) {
        //           if (scope.cal[curpos[0]][curpos[1]]['weeks'][curpos[2]][curpos[3]].value) {
        //             scope.cal[curpos[0]][curpos[1]]['weeks'][curpos[2]][curpos[3]].cell[0] = scope.selectinfo.toolselect;
        //           }
        //           curpos[3] += 1;
        //           if (curpos[3] >= scope.cal[curpos[0]][curpos[1]]['weeks'][curpos[2]].length) {
        //             curpos[3] = 0;
        //             curpos[2] += 1;
        //             if (curpos[2] >= scope.cal[curpos[0]][curpos[1]]['weeks'].length) {
        //               curpos[2] = 0;
        //               curpos[1] += 1;
        //               if (curpos[1] >= scope.cal[curpos[0]].length) {
        //                 curpos[1] = 0;
        //                 curpos[0] += 1;
        //                 if (curpos[0] >= scope.cal.length) {
        //                   break;
        //                 }
        //               }
        //             }
        //           }
        //         }
        //       }
        //       day.cell[0] = scope.selectinfo.toolselect;
        //       scope.selectinfo.lastselect = [];
        //     }
        //   } else {
        //     /* 单选模式 */
        //     if (day.cell[0] == scope.selectinfo.toolselect) {
        //       day.cell = [];
        //     } else {
        //       day.cell[0] = scope.selectinfo.toolselect;
        //     }
        //   }
        // } else {
        //   /* 点击日期无效 */
        //   if (scope.selectinfo.multiselect) {
        //     /* 复选模式下，清除选择记录 */
        //     scope.selectinfo.lastselect = [];
        //   }
        }
      };
      /* 设置显示模式 */
      if (attrs['mode'] == 'view') {
        scope.calmode = 'view';
        scope.$watchCollection('info', function(value, oldvalue) {
          if (value != oldvalue) {
            drawViewCalendar();
          }
        });
      } else if (attrs['mode'] == 'view-extra') {
        scope.calmode = 'view-extra';
        scope.$watchCollection('info', function(value, oldvalue) {
          if (value != oldvalue) {
            drawViewCalendar();
          }
        });
      }
      scope.selectinfo = {multiselect:false,
                          toolselect:'ion-briefcase',
                          lastselect:[]};
    }
  };
});
