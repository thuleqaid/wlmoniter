var mongoose = require('mongoose');
var companySchema = mongoose.Schema({
  name: {type:String, required:true},
  memo: {type:String, default:''},
  valid: {type:Boolean, required:true, default:true},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true},
  baseid: {type:String},
  version: {type:Number, required:true}
});

var HistoryCompany = mongoose.model('HistoryCompany', companySchema);

module.exports = HistoryCompany;
