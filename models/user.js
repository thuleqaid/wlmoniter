var mongoose = require('mongoose');
var HistoryUser = require('./historyUser');
var crypto = require('crypto');
var _ = require('underscore');
var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  first_name: {type:String, required:true},
  last_name: {type:String, required:true},
  workid: {type:String, default:''},
  reset_code: {type:String, default:''},
  permission: {type:[String], required:true, default:['modify']}, /* modify/create/admin */
  valid: {type:Boolean, required:true, default:true},
  salary: {type: {
    base: {type:Number, default: 0}
  }},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

userSchema.pre('save', function(next) {
  var user = this;
  var modPaths = _.without(user.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  user.increment();
  if (modPaths.indexOf('password') < 0) {
    return next();
  } else {
    var chksum = crypto.createHash('sha1');
    chksum.update(user.password);
    user.password = chksum.digest('hex');
    return next();
  }
});

userSchema.post('save', function(user) {
  var histobj = user.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryUser(histobj).save(function(err) {if (err) console.log(err);});
});

userSchema.methods.validatePassword = function(password) {
  var chksum = crypto.createHash('sha1');
  chksum.update(password);
  var result = (this.password == chksum.digest('hex'));
  result = result && this.valid;
  return result;
};

var User = mongoose.model('User', userSchema);

/* initial data */
User.find(function(err, users) {
  // 没有数据时，从init-user.txt中读取用户数据，逗号分隔，第1列是用户名，第2列是姓，第3列是名，第4列是工号，第5列是基本工资
  if (users.length) {
    return;
  }
  var fs = require('fs');
  var content = fs.readFileSync('./models/init-user.txt','utf-8');
  var lines = content.split('\n');
  var cnt = 0;
  for (var i = 0; i < lines.length; i++) {
    var parts = lines[i].split(',');
    if (parts.length >= 4) {
      cnt += 1;
      if (cnt <= 1) {
        // 第1个用户给予用户管理权限
        new User({email:parts[0] + '@kotei-info.com',
                  first_name:parts[2],
                  last_name:parts[1],
                  password:'123456',
                  reset_code:'',
                  salary: {
                    base: eval(parts[4]) || 5000
                  },
                  permission:['modify','create','admin'],
                  workid:parts[3],
                  date_update:Date.now()}).save();
      } else {
        new User({email:parts[0] + '@kotei-info.com',
                  first_name:parts[2],
                  last_name:parts[1],
                  password:'123456',
                  reset_code:'',
                  salary: {
                    base: eval(parts[4]) || 5000
                  },
                  workid:parts[3],
                  date_update:Date.now()}).save();
      }
    }
  }
});

module.exports = User;

