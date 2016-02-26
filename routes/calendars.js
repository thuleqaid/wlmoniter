var express = require('express');
var passport = require('passport');
var Project = require('../models/project');
var User = require('../models/user');
var WorkCalendar = require('../models/workCalendar');
var _ = require('underscore');

module.exports = function(io) {
  var router = express.Router();

  router.route('/calendar/:year')
    .get(function(req, res, next) {
      WorkCalendar.calendarInfo(req.params.year,1,req.params.year,12, function(info) {
        res.json(info);
      });
    });
  router.route('/workload')
    .post(function(req, res, next) {
      var year = parseInt(req.body.year);
      var month = parseInt(req.body.month);
      WorkCalendar.workloadInfo(year,month,year,month, function(workload) {
        Project.filterProject(year, month, year, month, function(projects) {
          WorkCalendar.calendarInfo(year,month,year,month, function(cal) {
            /* 取得人员数据列表 */
            var tmpusers = [];
            for (var i = 0; i < workload.length; i++) {
              for (var j = 0; j < workload[i]['detail'].length; j++) {
                if (tmpusers.indexOf(workload[i]['detail'][j].user) < 0) {
                  tmpusers.push(workload[i]['detail'][j].user);
                }
              }
            }
            User.find({_id:{$in: tmpusers}},
                      {email:1, first_name:1, last_name:1, workid:1, gender:1},
                      function(err, users) {
                        res.json({info:cal,extra:workload,users:users,projects:projects});
                      });
          });
        });
      });
    });
  return router;
};
