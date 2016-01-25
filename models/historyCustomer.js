var mongoose = require('mongoose');
var customerSchema = mongoose.Schema({
  email: {type:String, required:true},
  first_name: {type:String},
  last_name: {type:String, required:true},
  memo: {type:String, default:''},
  valid: {type:Boolean, required:true, default:true},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true},
  baseid: {type:String},
  version: {type:Number, required:true}
});

var HistoryCustomer = mongoose.model('HistoryCustomer', customerSchema);

module.exports = HistoryCustomer;
