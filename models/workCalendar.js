var mongoose = require('mongoose');
var HistoryWorkCalendar = require('./historyWorkCalendar');
var UserHour = require('./userHour');
var _ = require('underscore');
var calendarSchema = mongoose.Schema({
  year: {type:Number, required:true},
  month: {type:Number, required:true},
  workday: {type:[Number], default:[]},
  studyday: {type:[Number], default:[]},
  holiday: {type:[Number], default:[]},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

calendarSchema.pre('save', function(next) {
  var calendar = this;
  var modPaths = _.without(calendar.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  calendar.increment();
  return next();
});

calendarSchema.post('save', function(calendar) {
  var histobj = calendar.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryWorkCalendar(histobj).save(function(err) { if (err) console.log(err);});
});

calendarSchema.methods.workdays = function(start_day, end_day) {
  var date2 = new Date(this.year, this.month, 0);
  var day1 = start_day || 1;
  if (day1 <= 0 || day1 > date2.getDate()) {
    day1 = 1;
  }
  var day2 = end_day || 0;
  if (day2 <= 0 || day2 > date2.getDate()) {
    day2 = date2.getDate();
  }
  var date1 = new Date(this.year, this.month-1, day1);
  var workdaylist = [];
  if (day1 > day2) {
  } else {
    var weekday = date1.getDay();
    for (var day3 = day1; day3 <= day2; day3++) {
      if (weekday == 6 || weekday == 0) {
        if (this.workday.indexOf(day3) >= 0) {
          workdaylist.push(new Date(this.year, this.month - 1, day3));
        } else {
        }
      } else {
        if (this.holiday.indexOf(day3) >= 0) {
        } else {
          workdaylist.push(new Date(this.year, this.month - 1, day3));
        }
      }
      weekday = (weekday + 1) % 7;
    }
  }
  return workdaylist;
};

calendarSchema.statics.filterCalendar = function(year_start, month_start, year_end, month_end, cb) {
  if (typeof(cb) != 'function') {
    return;
  }
  var search;
  if (year_start == year_end) {
    search = this.find({$and:[{year:year_start, month:{$gte:month_start}},{year:year_start, month:{$lte:month_end}}]});
  } else {
    search = this.find({$or:[{year:year_start, month:{$gte:month_start}},
                                 {$and:[{year:{$gt:year_start}},
                                        {year:{$lt:year_end}}]},
                                 {year:year_end, month:{$lte:month_end}}]});
  }
  search.sort({year:1,month:1})
    .exec(function(err, calendars) {
      if (err) {
        console.log(err);
        cb();
        return;
      }
      /* 整理结果：出现无数据时自动补空数据 */
      var outlist = [];
      var cyear = year_start;
      var cmonth = month_start;
      for (var i = 0; i < calendars.length; i++) {
        while (calendars[i].year != cyear || calendars[i].month != cmonth) {
          outlist.push(new WorkCalendar({year:cyear, month:cmonth, workday:[], studyday:[], holiday:[]}));
          cmonth += 1;
          if (cmonth > 12) {
            cyear += 1;
            cmonth -= 12;
          }
        }
        outlist.push(calendars[i]);
        cmonth += 1;
        if (cmonth > 12) {
          cyear += 1;
          cmonth -= 12;
        }
      }
      month_end += 1;
      if (month_end > 12) {
        year_end += 1;
        month_end -= 12;
      }
      while (year_end != cyear || month_end != cmonth) {
        outlist.push(new WorkCalendar({year:cyear, month:cmonth, workday:[], studyday:[], holiday:[]}));
        cmonth += 1;
        if (cmonth > 12) {
          cyear += 1;
          cmonth -= 12;
        }
      }
      cb(outlist);
  });
};

calendarSchema.statics.countWorkdays = function(year_start, month_start, day_start, year_end, month_end, day_end, cb) {
  if (typeof(cb) != 'function') {
    return;
  }
  var year1, year2, month1, month2, day1, day2;
  year1 = year_start;
  month1 = month_start;
  day1 = day_start;
  year2 = year_end;
  month2 = month_end;
  day2 = day_end;
  this.filterCalendar(year1, month1, year2, month2, function(calendars) {
    var days = [];
    for (var i = 0; i < calendars.length; i++) {
      if (i == 0) {
        days.push(calendars[i].workdays(day1).length);
      } else if (i == calendars.length - 1) {
        days.push(calendars[i].workdays(1, day2).length);
      } else {
        days.push(calendars[i].workdays().length);
      }
    }
    days.unshift(days.reduce(function(a, b) {return a+b;}, 0));
    cb(days);
  });
};
calendarSchema.statics.calendarInfo = function(year_start, month_start, year_end, month_end, cb) {
  if (typeof(cb) != 'function') {
    return;
  }
  var date2 = new Date(year_end, month_end, 0);
  var year1, year2, month1, month2, day1, day2;
  year1 = year_start;
  month1 = month_start;
  day1 = 1;
  year2 = year_end;
  month2 = month_end;
  day2 = date2.getDate();
  this.filterCalendar(year1, month1, year2, month2, function(calendars) {
    var info = {workday:[],
                studyday:[],
                holiday:[]};
    for (var i = 0; i < calendars.length; i++) {
      if (calendars[i].workday.length == 1 && !calendars[i].workday[0]) {
        /* 从数据库中读出来的数据可能是：[null] */
        info.workday.push([]);
      } else {
        info.workday.push(calendars[i].workday);
      }
      if (calendars[i].studyday.length == 1 && !calendars[i].studyday[0]) {
        /* 从数据库中读出来的数据可能是：[null] */
        info.studyday.push([]);
      } else {
        info.studyday.push(calendars[i].studyday);
      }
      if (calendars[i].holiday.length == 1 && !calendars[i].holiday[0]) {
        /* 从数据库中读出来的数据可能是：[null] */
        info.holiday.push([]);
      } else {
        info.holiday.push(calendars[i].holiday);
      }
    }
    cb(info);
  });
};
calendarSchema.statics.workloadInfo = function(year_start, month_start, year_end, month_end, cb) {
  if (typeof(cb) != 'function') {
    return;
  }
  this.filterCalendar(year_start, month_start, year_end, month_end, function(calendars) {
    var workdays = [];
    for (var i = 0; i < calendars.length; i++) {
      var tmpworkdays = calendars[i].workdays();
      for (var j = 0; j < tmpworkdays.length; j++) {
        workdays.push(tmpworkdays[j].valueOf());
      }
    }
    UserHour.filterUser(new Date(year_start, month_start - 1, 1), new Date(year_end, month_end, 1), function(data) {
      for (var i = 0; i < data.length; i++) {
        if (workdays.indexOf(data[i].date.valueOf()) < 0) {
          for (var j = 0; j < data[i].detail.length; j++) {
            data[i].detail[j].total = 0;
            data[i].detail[j].available = 0;
          }
        }
      }
      cb(data);
    });
  });
};

var WorkCalendar = mongoose.model('WorkCalendar', calendarSchema);

/* initial data */
WorkCalendar.find(function(err, calendars) {
  // 没有数据时，从init-workcalendar.txt中读取公司年历数据，逗号分隔
  // 第1列是年，第2列是月，第3列是额外工作日（分号分隔），第4列是学习日（分号分隔，需要出勤，但不做业务），第5列是额外休假（分号分隔）
  var fs = require('fs');
  if (fs.existsSync('./models/init-workcalendar.txt')) {
    var content = fs.readFileSync('./models/init-workcalendar.txt','utf-8');
    var lines = content.split('\n');
    var cnt = 0;
    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts.length >= 5) {
        cnt += 1;
        var flag = true;
        for (var subi = 0; subi < calendars.length; subi++) {
          if (calendars[subi].year == parts[0] && calendars[subi].month == parts[1]) {
            /* 指定月份的数据已经存在，更新 */
            calendars[subi].workday = parts[2].split(';');
            calendars[subi].studyday = parts[3].split(';');
            calendars[subi].holiday = parts[4].split(';');
            calendars[subi].date_update = Date.now();
            calendars[subi].save(function(err) {
              if (err) {
                console.log(err);
              }
            });
            flag = false;
            break;
          }
        }
        if (flag) {
          /* 指定月份的数据不存在，新建 */
          new WorkCalendar({year:parts[0],
                            month:parts[1],
                            workday:parts[2].split(';'),
                            studyday:parts[3].split(';'),
                            holiday:parts[4].split(';'),
                            date_update:Date.now()}).save(function(err) {
                              if (err) {
                                console.log(err);
                              }
                            });
        }
      }
    }
  }
});
// WorkCalendar.countWorkdays(2015, 12, 13, 2016, 2, 23, function(days) {
//   console.log(days);
// });
// WorkCalendar.calendarInfo(2015,12,2016,3,function(info) {
//   console.log(info);
// });
// WorkCalendar.workloadInfo(2016,2,2016,2,function(data) {
//   for (var i = 0; i < data.length; i++) {
//     console.log(data[i].date);
//     for (var j = 0; j < data[i].detail.length; j++) {
//       console.log(j,data[i].detail[j]);
//     }
//   }
// });
module.exports = WorkCalendar;
