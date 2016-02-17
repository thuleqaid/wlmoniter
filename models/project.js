var mongoose = require('mongoose');
var HistoryProject = require('./historyProject');
var _ = require('underscore');
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
  date_update: {type:Date, required:true}
});

projectSchema.pre('save', function(next) {
  var project = this;
  var modPaths = _.without(project.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  project.increment();
  return next();
});

projectSchema.post('save', function(project) {
  var histobj = project.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryProject(histobj).save(function(err) {if (err) console.log(err);});
});

var Project = mongoose.model('Project', projectSchema);

/* initial data */
Project.find(function(err, projects) {
  // 没有数据时，从init-project.txt中读取项目数据，逗号分隔，第1列是项目名
  if (projects.length) {
    return;
  }
  var fs = require('fs');
  if (!fs.existsSync('./models/init-project.txt')) {
    return;
  }
  var content = fs.readFileSync('./models/init-project.txt','utf-8');
  var lines = content.split('\n');
  var cnt = 0;
  for (var i = 0; i < lines.length; i++) {
    var parts = lines[i].split(',');
    if (parts.length >= 1) {
      cnt += 1;
      new Project({name:parts[0],
                   date_update:Date.now()}).save();
    }
  }
});

module.exports = Project;

