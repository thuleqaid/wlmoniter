var mongoose = require('mongoose');
var HistoryCustomer = require('./historyCustomer');
var _ = require('underscore');
var customerSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  companyid: {type:String, required:true},
  first_name: {type:String},
  last_name: {type:String, required:true},
  memo: {type:String, default:''},
  valid: {type:Boolean, required:true, default:true},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

customerSchema.pre('save', function(next) {
  var customer = this;
  var modPaths = _.without(customer.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  customer.increment();
  return next();
});

customerSchema.post('save', function(customer) {
  var histobj = customer.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryCustomer(histobj).save(function(err) {if (err) console.log(err);});
});

var Customer = mongoose.model('Customer', customerSchema);

/* initial data */
Customer.find(function(err, customers) {
  // 没有数据时，从init-customer.txt中读取用户数据，逗号分隔，第1列是公司名，第2列是邮箱，第3列是姓，第4列是名
  if (customers.length) {
    return;
  }
  var fs = require('fs');
  if (!fs.existsSync('./models/init-customer.txt')) {
    return;
  }
  var Company = require('./company');
  Company.find(function(err, companies) {
    if (companies.length) {
      var content = fs.readFileSync('./models/init-customer.txt','utf-8');
      var lines = content.split('\n');
      var cnt = 0;
      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split(',');
        if (parts.length >= 2) {
          cnt += 1;
          var company = _.find(companies, function(company) {
            return company.name == parts[0];
          });
          if (company) {
            new Customer({email:parts[1],
                          companyid:company._id,
                          first_name:parts[3] || '',
                          last_name:parts[2],
                          date_update:Date.now()}).save();
          }
        }
      }
    }
  });
});

module.exports = Customer;

