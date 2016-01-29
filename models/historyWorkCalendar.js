var mongoose = require('mongoose');
var calendarSchema = mongoose.Schema({
  year: {type:Number, required:true},
  month: {type:Number, required:true},
  workday: {type:[Number], default:[]},
  studyday: {type:[Number], default:[]},
  holiday: {type:[Number], default:[]},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true},
  baseid: {type:String},
  version: {type:Number, required:true}
});

var HistoryWorkCalendar = mongoose.model('HistoryWorkCalendar', calendarSchema);

module.exports = HistoryWorkCalendar;
