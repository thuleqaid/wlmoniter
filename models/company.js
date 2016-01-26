var mongoose = require('mongoose');
var HistoryCompany = require('./historyCompany');
var _ = require('underscore');
var companySchema = mongoose.Schema({
  name: {type:String, required:true, unique:true},
  memo: {type:String, default:''},
  valid: {type:Boolean, required:true, default:true},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

companySchema.pre('save', function(next) {
  var company = this;
  var modPaths = _.without(company.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  company.increment();
  return next();
});

companySchema.post('save', function(company) {
  var histobj = company.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryCompany(histobj).save(function(err) { if (err) console.log(err);});
});

var Company = mongoose.model('Company', companySchema);

/* initial data */
Company.find(function(err, customers) {
  // 没有数据时，从init-company.txt中读取客户公司数据，逗号分隔，第1列是公司名
  if (customers.length) {
    return;
  }
  var fs = require('fs');
  var content = fs.readFileSync('./models/init-company.txt','utf-8');
  var lines = content.split('\n');
  var cnt = 0;
  for (var i = 0; i < lines.length; i++) {
    var parts = lines[i].split(',');
    if (parts.length >= 1) {
      cnt += 1;
      new Company({name:parts[0],
                   date_update:Date.now()}).save();
    }
  }
});

module.exports = Company;
