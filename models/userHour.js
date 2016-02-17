var mongoose = require('mongoose');
var HistoryUserHour = require('./historyUserHour');
var _ = require('underscore');
var userHourSchema = mongoose.Schema({
  user: {type:String, required:true},
  start_date: {type:Date, required:true},
  hour: {type:Number, required:true, default:8},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

userHourSchema.pre('save', function(next) {
  var user = this;
  var modPaths = _.without(user.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  user.increment();
  return next();
});

userHourSchema.post('save', function(user) {
  var histobj = user.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryUserHour(histobj).save(function(err) {if (err) console.log(err);});
});

userHourSchema.statics.filterUser = function(date_start, date_end, cb) {
  /* 查找指定期间内有效用户（可投入工时大于0,不考虑休假） */
  if (typeof(cb) != 'function') {
    return;
  }
  this.find().sort({user:1, start_date:1}).exec(function(err, records) {
    if (err) {
      console.log(err);
      cb();
      return;
    }
    /* 初始化输出数组 */
    /* 输出数据格式 */
    /* [{'date'   : date_start,
         'detail' : [{'user'      : userid,
                      'total'     : hours,
                      'available' : hours},
                     ...
                    ]},
        ...
        {'date'   : date_end - 1 day,
         'detail' : [...]}
       ] */
    var validusers = [];
    var idxdate = new Date(date_start);
    var daycnt, reccnt, secthour;
    while (idxdate < date_end) {
      validusers.push({'date':new Date(idxdate),'detail':[]});
      idxdate.setTime(idxdate.getTime() + 86400000);
    }
    /* 设置输出数组 */
    var lastuser = '';
    var curuser = [];
    for (var i = 0; i < records.length; i++) {
      if (lastuser != records[i].user) {
        if (curuser.length > 0) {
          /* 判断当前user在指定期间内是否有效 */
          if (curuser[0].start_date > date_end) {
            /* 有效期间在指定期间之外 */
          } else {
            if (curuser.length == 1) {
              /* 只有一条记录 */
              if (curuser[0].hour <= 0) {
                /* 一直处于不计算工时状态 */
              } else {
                /* 计算每一天的总工时 */
                for (daycnt = 0; daycnt < validusers.length; daycnt++) {
                  if (validusers[daycnt]['date'] < curuser[0].start_date) {
                    validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                       'total':0,
                                                       'available':0});
                  } else {
                    validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                       'total':curuser[0].hour,
                                                       'available':curuser[0].hour});
                  }
                }
              }
            } else {
              /* 有多条记录 */
              /* 查找合适的记录开始index */
              reccnt = 0;
              while (reccnt < curuser.length && curuser[reccnt].start_date < date_start) {
                reccnt += 1;
              }
              /* 计算每一天的总工时 */
              if (reccnt >= curuser.length) {
                /* 最后一条有效期间记录比指定期间早 */
                secthour = curuser[reccnt - 1].hour;
                if (secthour > 0) {
                  for (daycnt = 0; daycnt < validusers.length; daycnt++) {
                    validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                       'total':secthour,
                                                       'available':secthour});
                  }
                }
              } else {
                if (reccnt <= 0) {
                  /* 有效期间是从指定期间中途开始 */
                  secthour = 0;
                } else {
                  secthour = curuser[reccnt - 1].hour;
                }
                for (daycnt = 0; daycnt < validusers.length; daycnt++) {
                  if (reccnt < curuser.length) {
                    if (validusers[daycnt]['date'] >= curuser[reccnt].start_date) {
                      secthour = curuser[reccnt].hour;
                      reccnt += 1;
                    }
                  }
                  validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                     'total':secthour,
                                                     'available':secthour});
                }
              }
            }
          }
          curuser = [];
        }
        lastuser  = records[i].user;
      }
      curuser.push(records[i]);
    }
    /* 最后一个用户数据 */
    if (curuser.length > 0) {
      /* 判断当前user在指定期间内是否有效 */
      if (curuser[0].start_date > date_end) {
        /* 有效期间在指定期间之外 */
      } else {
        if (curuser.length == 1) {
          /* 只有一条记录 */
          if (curuser[0].hour <= 0) {
            /* 一直处于不计算工时状态 */
          } else {
            /* 计算每一天的总工时 */
            for (daycnt = 0; daycnt < validusers.length; daycnt++) {
              if (validusers[daycnt]['date'] < curuser[0].start_date) {
                validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                   'total':0,
                                                   'available':0});
              } else {
                validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                   'total':curuser[0].hour,
                                                   'available':curuser[0].hour});
              }
            }
          }
        } else {
          /* 有多条记录 */
          /* 查找合适的记录开始index */
          reccnt = 0;
          while (reccnt < curuser.length && curuser[reccnt].start_date < date_start) {
            reccnt += 1;
          }
          /* 计算每一天的总工时 */
          if (reccnt >= curuser.length) {
            /* 最后一条有效期间记录比指定期间早 */
            secthour = curuser[reccnt - 1].hour;
            if (secthour > 0) {
              for (daycnt = 0; daycnt < validusers.length; daycnt++) {
                validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                   'total':secthour,
                                                   'available':secthour});
              }
            }
          } else {
            if (reccnt <= 0) {
              /* 有效期间是从指定期间中途开始 */
              secthour = 0;
            } else {
              secthour = curuser[reccnt - 1].hour;
            }
            for (daycnt = 0; daycnt < validusers.length; daycnt++) {
              if (reccnt < curuser.length) {
                if (validusers[daycnt]['date'] >= curuser[reccnt].start_date) {
                  secthour = curuser[reccnt].hour;
                  reccnt += 1;
                }
              }
              validusers[daycnt]['detail'].push({'user':curuser[0].user,
                                                 'total':secthour,
                                                 'available':secthour});
            }
          }
        }
      }
      curuser = [];
    }
    cb(validusers);
    return;
  });
};

var UserHour = mongoose.model('UserHour', userHourSchema);

module.exports = UserHour;

