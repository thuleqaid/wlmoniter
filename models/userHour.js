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
  /* ����ָ���ڼ�����Ч�û�����Ͷ�빤ʱ����0,�������ݼ٣� */
  if (typeof(cb) != 'function') {
    return;
  }
  this.find().sort({user:1, start_date:1}).exec(function(err, records) {
    if (err) {
      console.log(err);
      cb();
      return;
    }
    /* ��ʼ��������� */
    /* ������ݸ�ʽ */
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
    /* ����������� */
    var lastuser = '';
    var curuser = [];
    for (var i = 0; i < records.length; i++) {
      if (lastuser != records[i].user) {
        if (curuser.length > 0) {
          /* �жϵ�ǰuser��ָ���ڼ����Ƿ���Ч */
          if (curuser[0].start_date > date_end) {
            /* ��Ч�ڼ���ָ���ڼ�֮�� */
          } else {
            if (curuser.length == 1) {
              /* ֻ��һ����¼ */
              if (curuser[0].hour <= 0) {
                /* һֱ���ڲ����㹤ʱ״̬ */
              } else {
                /* ����ÿһ����ܹ�ʱ */
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
              /* �ж�����¼ */
              /* ���Һ��ʵļ�¼��ʼindex */
              reccnt = 0;
              while (reccnt < curuser.length && curuser[reccnt].start_date < date_start) {
                reccnt += 1;
              }
              /* ����ÿһ����ܹ�ʱ */
              if (reccnt >= curuser.length) {
                /* ���һ����Ч�ڼ��¼��ָ���ڼ��� */
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
                  /* ��Ч�ڼ��Ǵ�ָ���ڼ���;��ʼ */
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
    /* ���һ���û����� */
    if (curuser.length > 0) {
      /* �жϵ�ǰuser��ָ���ڼ����Ƿ���Ч */
      if (curuser[0].start_date > date_end) {
        /* ��Ч�ڼ���ָ���ڼ�֮�� */
      } else {
        if (curuser.length == 1) {
          /* ֻ��һ����¼ */
          if (curuser[0].hour <= 0) {
            /* һֱ���ڲ����㹤ʱ״̬ */
          } else {
            /* ����ÿһ����ܹ�ʱ */
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
          /* �ж�����¼ */
          /* ���Һ��ʵļ�¼��ʼindex */
          reccnt = 0;
          while (reccnt < curuser.length && curuser[reccnt].start_date < date_start) {
            reccnt += 1;
          }
          /* ����ÿһ����ܹ�ʱ */
          if (reccnt >= curuser.length) {
            /* ���һ����Ч�ڼ��¼��ָ���ڼ��� */
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
              /* ��Ч�ڼ��Ǵ�ָ���ڼ���;��ʼ */
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

