var express = require('express');
var passport = require('passport');
var Project = require('../models/project');
var User = require('../models/user');
var WorkCalendar = require('../models/workCalendar');

module.exports = function(io) {
  var router = express.Router();

  router.route('/calendar/:year')
    .get(function(req, res, next) {
      WorkCalendar.calendarInfo(req.params.year,1,req.params.year,12, function(info) {
        res.json(info);
      });
    });
  return router;
};
