var express = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');
var passport = require('passport');
var crypto = require('crypto');
var AccessToken = require('../models/accessToken');
var User = require('../models/user');
var ApplyUser = require('../models/applyUser');
var nodemailer = require('nodemailer');

module.exports = function(io) {
  var router = express.Router();
  var sendMail = function(to, reset_code) {
    var subject = process.env.MAIL_SUBJECT;
    var address = 'http://'+process.env.HOST+':'+process.env.PORT+'/#/resetpassword/'+reset_code+'/'+to.substr(0,to.lastIndexOf('@'));
    var html = '<a href="'+address+'">Reset Link</a>';
    var transport = nodemailer.createTransport("SMTP", {
      host: process.env.MAIL_HOST,
      secureConnection: true,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    var mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: subject,
      html: html
    };
    transport.sendMail(mailOptions, function(err, info) {
      if (err) {
        // console.log(err);
      } else {
        console.log(info.response);
      }
    });
  };

  router.route('/login').post(function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      /* check password and generate access token */
      if (err) {
        /* console.log("passport-local-authenticate:"+err+","+user+","+info.message); */
        return next(err);
      }
      if (!user) {
        /* console.log("passport-local-authenticate:"+err+","+user+","+info.message); */
        return res.status(401).json({error:'email/password'});
      }
      /* console.log("passport-local-authenticate:"+err+","+user); */
      /* Todo: multi-device login with different tokens */
      /* One device can obtain only one access token */
      var clientid = req.body.clientid || 'browser';
      AccessToken.remove({userid:user._id, clientid:clientid}, function(err) {
        if (err) {
          /* console.log("Remove Error:"+err); */
        }
      });
      var random_token = crypto.randomBytes(32).toString('hex');
      var expires = moment().add(5, 'days').valueOf();
      var token = jwt.encode({iss:user._id,
                              exp:expires,
                              jti:random_token}, process.env.JWTSECRET);
      /* Add access token record */
      var access_token = new AccessToken({userid:user._id,
                                          token:random_token,
                                          clientid:clientid});
      access_token.save(function(err) {
        if (err) {
          return next(err);
        }
      });
      /* return JsonWebToken */
      res.json({token:token,
                user:{
                  _id: user._id,
                  email: user.email,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  permission: user.permission
                }
               });
    })(req, res, next);
  });

  router.route('/logout').post(function(req, res, next) {
    passport.authenticate('bearer', {session:false}, function(err, token) {
      if (err) {
        return next(err);
      }
      if (!token) {
        return res.status(401).json({error:'wrong token'});
      }
      AccessToken.remove({_id:token._id},function(err) {});
      res.json({message:'ok'});
    })(req, res, next);
  });

  router.route('/register').post(function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    if (username && password && firstname && lastname) {
      var random_password = crypto.randomBytes(8).toString('hex');
      var reset_code = crypto.randomBytes(32).toString('hex');
      /* make the first register user as administrator */
      User.count(function(err, count) {
        if (err) {
          return next(err);
        }
        if (count <= 0) {
          new User({email:username,
                    first_name:firstname,
                    last_name:lastname,
                    password:random_password,
                    reset_code:reset_code,
                    permission:['modify','create','admin'],
                    date_update:Date.now()}).save();
          io.sockets.emit('table-user', {message:'add',email:username});
          sendMail(username, reset_code);
          res.json({message:'ok'});
        } else {
          var autoConfirm =false;
          if (process.env.MAIL_AUTOALLOW && process.env.MAIL_AUTOALLOW.toLowerCase() === 'true') {
            autoConfirm = true;
          }
          User.findOne({email:username}, function(err,user) {
            if (err) {
              return next(err);
            }
            if (!user) {
              ApplyUser.findOne({email:username}, function(suberr, appuser) {
                if (suberr) {
                  return next(suberr);
                }
                if (!appuser) {
                  if (autoConfirm) {
                    /* Add record to User collection */
                    new User({email:username,
                              first_name:firstname,
                              last_name:lastname,
                              password:random_password,
                              reset_code:reset_code,
                              date_update:Date.now()}).save();
                    sendMail(username, reset_code);
                    io.sockets.emit('table-user', {message:'add', email:username});
                  } else {
                    /* Add record to ApplyUser collection */
                    new ApplyUser({email:username,
                                   first_name:firstname,
                                   last_name:lastname}).save();
                    io.sockets.emit('table-applyuser', {message:'add', email:username});
                  }
                  return res.json({message:'ok'});
                } else {
                  if (autoConfirm) {
                    /* Remove record from ApplyUser collection */
                    ApplyUser.remove({_id:appuser._id}, function(err) { });
                    io.sockets.emit('table-applyuser', {message:'del', email:username});
                    /* Add record to User collection */
                    new User({email:username,
                              first_name:firstname,
                              last_name:lastname,
                              password:random_password,
                              reset_code:reset_code,
                              date_update:Date.now()}).save();
                    sendMail(username, reset_code);
                    io.sockets.emit('table-user', {message:'add', email:username});
                    return res.json({message:'ok'});
                  }
                }
              });
            }
          });
        }
      });
    } else {
      res.json({message:'ok'});
    }
  });

  router.route('/resetpassword').post(function(req, res, next) {
    var email = req.body.username;
    var password = req.body.password;
    var reset_code = req.body.resetcode;
    if (email && password && reset_code) {
      User.findOne({email:email, reset_code:reset_code}, function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(null, false);
        }
        user.reset_code = '';
        user.password = password;
        user.save();
      });
      res.json({message:'ok'});
    }
  });

  router.route('/forgotpassword').post(function(req, res, next) {
    var email = req.body.username;
    User.findOne({email:email}, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(null, false);
      }
      if (user.valid) {
        var reset_code = crypto.randomBytes(32).toString('hex');
        user.reset_code = reset_code;
        user.save(function(err) {});
        console.log('reset mail:'+email+':'+reset_code);
        sendMail(email, reset_code);
      }
    });
    res.json({message:'ok'});
  });

  router.route('/apply')
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
          if (!user) {
            return res.json({message:'No Permission'});
          }
          if (user.permission.indexOf('admin') < 0) {
            res.json({message:'No Permission'});
          } else {
            ApplyUser.find().sort('email').exec(function(err, appusers) {
              if (err) {
                res.send(err);
              } else {
                res.json(appusers);
              }
            });
          }
        });
      })(req, res, next);
    })
    .post(function(req, res, next) {
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
          if (!user) {
            return res.json({message:'No Permission'});
          }
          if (user.permission.indexOf('admin') < 0) {
            res.json({message:'No Permission'});
          } else {
            var appid = req.body.appid;
            var action = req.body.action;
            ApplyUser.findOne({_id:appid}, function(err, appuser) {
              if (err) {
                return res.send(err);
              }
              if (!appuser) {
                return res.json({message:'Wrong ApplyID'});
              }
              var username = appuser.email;
              var firstname = appuser.first_name;
              var lastname = appuser.last_name;
              ApplyUser.remove({_id:appuser._id}, function(err) { });
              io.sockets.emit('table-applyuser', {message:'del', email:username});
              if (action=='allow') {
                /* Add record to User collection */
                var random_password = crypto.randomBytes(8).toString('hex');
                var reset_code = crypto.randomBytes(32).toString('hex');
                new User({email:username,
                          first_name:firstname,
                          last_name:lastname,
                          password:random_password,
                          reset_code:reset_code,
                          updater:user.id,
                          date_update:Date.now()}).save();
                sendMail(username, reset_code);
                io.sockets.emit('table-user', {message:'add', email:username});
              }
            });
          }
        });
      })(req, res, next);
    });

  router.route('/api')
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
          var fields = {'password':0};
          if (!user || user.permission.indexOf('admin') < 0) {
            fields.permission = 0;
          }
          User.find({}, fields).sort('email').exec(function(err, users) {
            if (err) {
              res.send(err);
            }
            res.json(users);
          });
        });
      })(req, res, next);
    })
    .post(function(req, res) {
      res.json({message:'Not Support'});
    });
  router.route('/api/:id')
    .put(function(req, res, next) {
      passport.authenticate('bearer', {session:false}, function(err, token) {
        if (err) {
          return next(err);
        }
        if (!token) {
          return res.status(401).json({error:'wrong token'});
        }
        User.findOne({_id:token.userid}).exec(function(err, curuser) {
          if (err) {
            return res.send(err);
          }
          if (!curuser) {
            return res.status(401).json({error:'No Permission'});
          }
          User.findOne({_id:req.params.id}).exec(function(err, user) {
            if (err) {
              return res.send(err);
            }
            /* update each field of record */
            for (var prop in req.body) {
              if (prop != 'password') {
                if (prop == 'permission' && curuser.permission.indexOf('admin') < 0) {
                } else {
                  user[prop] = req.body[prop];
                }
              }
            }
            /* set updater and update date */
            user.updater = curuser._id;
            user.date_update = Date.now();
            /* save record */
            user.save(function(err) {
              if (err) {
                return res.send(err);
              }
              io.sockets.emit('table-user', {message:'chg', email:user.email});
              res.json({message:'Successful'});
            });
          });
        });
      })(req, res, next);
    })
    .get(passport.authenticate('bearer', {session:false}), function(req, res) {
      User.findOne({_id:req.params.id}).exec(function(err, user) {
        if (err) {
          return res.send(err);
        }
        res.json(user);
      });
    })
    .delete(function(req, res) {
      res.json({message:'Not Support'});
    });
  return router;
};
