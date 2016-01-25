var express = require('express');
var passport = require('passport');
var Company = require('../models/company');
var Customer = require('../models/customer');
var User = require('../models/user');

module.exports = function(io) {
  var router = express.Router();

  router.route('/company')
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
          Company.find().sort('_id').exec(function(err, companies) {
            if (err) {
              res.send(err);
            }
            res.json(companies);
          });
        });
      })(req, res, next);
    })
    .post(function(req, res) {
      res.json({message:'Not Support'});
    });
  router.route('/company/:id')
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
          Company.findOne({_id:req.params.id}).exec(function(err, company) {
            if (err) {
              return res.send(err);
            }
            if (!company) {
              return res.status(401).json({error:'Invalid CompanyID'});
            }
            /* update each field of record */
            for (var prop in req.body) {
              company[prop] = req.body[prop];
            }
            /* set updater and update date */
            company.updater = user._id;
            company.date_update = Date.now();
            /* save record */
            company.save(function(err) {
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
          Company.findOne({_id:req.params.id}).exec(function(err, company) {
            if (err) {
              return res.send(err);
            }
            res.json(company);
          });
        });
      })(req, res, next);
    })
    .delete(function(req, res) {
      res.json({message:'Not Support'});
    });

  router.route('/customer')
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
          Customer.find().sort('_id').exec(function(err, customers) {
            if (err) {
              res.send(err);
            }
            res.json(customers);
          });
        });
      })(req, res, next);
    })
    .post(function(req, res) {
      res.json({message:'Not Support'});
    });
  router.route('/customer/:id')
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
          Customer.findOne({_id:req.params.id}).exec(function(err, customer) {
            if (err) {
              return res.send(err);
            }
            if (!customer) {
              return res.status(401).json({error:'Invalid CustomerID'});
            }
            /* update each field of record */
            for (var prop in req.body) {
              customer[prop] = req.body[prop];
            }
            /* set updater and update date */
            customer.updater = user._id;
            customer.date_update = Date.now();
            /* save record */
            customer.save(function(err) {
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
          Customer.findOne({_id:req.params.id}).exec(function(err, customer) {
            if (err) {
              return res.send(err);
            }
            res.json(customer);
          });
        });
      })(req, res, next);
    })
    .delete(function(req, res) {
      res.json({message:'Not Support'});
    });
  return router;
};
