var mongoose = require('mongoose');
var projectSchema = mongoose.Schema({
  name: {type:String, required:true},
  status: {type:String, default:'ToDo'}, /* ToDo, Doing, Done, Cancelled */
  content: {type:String},
  customerid: {type:[String]},
  leaderid: {type:String},
  memberid: {type:[String]},
  startdate_public: {type:Date},
  enddate_public: {type:Date},
  cost_public: {type:Number},
  startdate_plan: {type:Date},
  enddate_plan: {type:Date},
  cost_plan: {type:Number},
  startdate_fact: {type:Date},
  enddate_fact: {type:Date},
  cost_fact: {type:Number},
  work_place: {type:String},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true},
  baseid: {type:String},
  version: {type:Number, required:true}
});

var HistoryProject = mongoose.model('HistoryProject', projectSchema);

module.exports = HistoryProject;

