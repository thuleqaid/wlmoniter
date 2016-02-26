var mongoose = require('mongoose');
var HistoryWorkPlan = require('./historyWorkPlan');
var _ = require('underscore');
var workPlanSchema = mongoose.Schema({
  project: {type:String, required:true},
  user: {type:String, required:true},
  plan: {type:[{
    start_date: {type:Date, required:true},
    hour: {type:Number, required:true, default:8}
  }]},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

workPlanSchema.pre('save', function(next) {
  var user = this;
  var modPaths = _.without(user.modifiedPaths(), 'updater', 'date_update');
  if (modPaths.length <= 0) return next(new Error('not changed'));
  user.increment();
  return next();
});

workPlanSchema.post('save', function(user) {
  var histobj = user.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryWorkPlan(histobj).save(function(err) {if (err) console.log(err);});
});

workPlanSchema.statics.planList = function(projects, cb) {
  if (typeof(cb) != 'function') {
    return;
  }
  console.log(projects);
  this.find({project:{$in:projects}}).sort({project:1,user:1}).exec(function(err, plans) {
    var outdata = {};
    var last_project = '';
    var tmplist = [];
    for (var i = 0; i < plans.length; i++) {
      if (plans[i].project != last_project) {
        if (last_project != '') {
          outdata[last_project] = tmplist.slice(0);
        }
        last_project = plans[i].project;
        tmplist = [];
      }
      tmplist.push(plans[i]);
    }
    if (last_project != '') {
      outdata[last_project] = tmplist.slice(0);
    }
    cb(outdata);
  });
};

var WorkPlan = mongoose.model('WorkPlan', workPlanSchema);

module.exports = WorkPlan;

