var mongoose = require('mongoose');
var userHourSchema = mongoose.Schema({
  user: {type:String, required:true},
  start_date: {type:Date, required:true},
  hour: {type:Number, required:true, default:8},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true},
  baseid: {type:String},
  version: {type:Number, required:true}
});

var HistoryUserHour = mongoose.model('HistoryUserHour', userHourSchema);

module.exports = HistoryUserHour;
