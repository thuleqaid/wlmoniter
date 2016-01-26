var express = require('express');
var passport = require('passport');
var Project = require('../models/project');
var User = require('../models/user');

module.exports = function(io) {
  var router = express.Router();

  router.route('/project')
    .get(function(req, res, next) {
      passport.authenticate('bearer', {session:false}, function(err, token) {
        if (err) {
          return next(err);
        }
        if (!token) {
          return res.status(401).json({error:'wrong token'});
        }
        User.findOne({_id:token.userid}).exec(function(err, user) {
          if (err) {
            return res.send(err);
          }
          if (!user || !user.valid) {
            return res.status(401).json({error:'invalid user'});
          }
          Project.find().sort('_id').exec(function(err, projects) {
            if (err) {
              res.send(err);
            }
            res.json(projects);
          });
        });
      })(req, res, next);
    })
    .post(function(req, res) {
      res.json({message:'Not Support'});
    });
  router.route('/project/:id')
    .put(function(req, res, next) {
      passport.authenticate('bearer', {session:false}, function(err, token) {
        if (err) {
          return next(err);
        }
        if (!token) {
          return res.status(401).json({error:'wrong token'});
        }
        User.findOne({_id:token.userid}).exec(function(err, user) {
          if (err) {
            return res.send(err);
          }
          if (!user || !user.valid) {
            return res.status(401).json({error:'invalid user'});
          }
          if ((user.permission.indexOf('admin') < 0) && (user.permission.indexOf('create'))) {
            return res.status(401).json({error:'no permission'});
          }
          Project.findOne({_id:req.params.id}).exec(function(err, project) {
            if (err) {
              return res.send(err);
            }
            if (!project) {
              return res.status(401).json({error:'Invalid ProjectID'});
            }
            /* update each field of record */
            for (var prop in req.body) {
              project[prop] = req.body[prop];
            }
            /* set updater and update date */
            project.updater = user._id;
            project.date_update = Date.now();
            /* save record */
            project.save(function(err) {
              if (err) {
                return res.send(err);
              }
              res.json({message:'Successful'});
            });
          });
        });
      })(req, res, next);
    })
    .get(function(req, res, next) {
      passport.authenticate('bearer', {session:false}, function(err, token) {
        if (err) {
          return next(err);
        }
        if (!token) {
          return res.status(401).json({error:'wrong token'});
        }
        User.findOne({_id:token.userid}).exec(function(err, user) {
          if (err) {
            return res.send(err);
          }
          if (!user || !user.valid) {
            return res.status(401).json({error:'invalid user'});
          }
          Project.findOne({_id:req.params.id}).exec(function(err, project) {
            if (err) {
              return res.send(err);
            }
            res.json(project);
          });
        });
      })(req, res, next);
    })
    .delete(function(req, res) {
      res.json({message:'Not Support'});
    });
  return router;
};
