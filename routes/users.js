var express = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');
var passport = require('passport');
var crypto = require('crypto');
var AccessToken = require('../models/accessToken');
var User = require('../models/user');
var ApplyUser = require('../models/applyUser');
var router = express.Router();

var nodemailer = require('nodemailer');
var sendMail = function(to, reset_code) {
  var subject = process.env.MAIL_SUBJECT;
  var address = 'http://'+process.env.HOST+':'+process.env.PORT+'/#/resetpassword';
  var html = '<a href="'+address+'">Reset Link</a><p>Reset Code:<pre>'+reset_code+'</pre></p>';
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
      /* console.log(err); */
    } else {
      /* console.log(info.response); */
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
    var clientid = 'browser';
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
                userid: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
              }
            });
  })(req, res, next);
});

router.route('/logout').post(passport.authenticate('bearer', {session:false}), function(req, res, next) {
  var decoded = jwt.decode(req.body.token, process.env.JWTSECRET);
  AccessToken.remove({userid:decoded.iss, token:decoded.jti},function(err) { });
  res.json({message:'ok'});
});

router.route('/register').post(function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  if (username && password && firstname && lastname) {
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
          var random_password = crypto.randomBytes(8).toString('hex');
          var reset_code = crypto.randomBytes(32).toString('hex');
          if (!appuser) {
            if (autoConfirm) {
              /* Add record to User collection */
              new User({email:username,
                        first_name:firstname,
                        last_name:lastname,
                        password:random_password,
                        reset_code:reset_code}).save();
              sendMail(username, reset_code);
            } else {
              /* Add record to ApplyUser collection */
              new ApplyUser({email:username,
                             first_name:firstname,
                             last_name:lastname}).save();
            }
            return;
          }
          if (autoConfirm) {
            /* Remove record from ApplyUser collection */
            ApplyUser.remove({_id:appuser._id}, function(err) { });
            /* Add record to User collection */
            new User({email:username,
                      first_name:firstname,
                      last_name:lastname,
                      password:random_password,
                      reset_code:reset_code}).save();
            sendMail(username, reset_code);
          }
        });
      }
    });
  }
  res.json({message:'ok'});
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
  var reset_code = crypto.randomBytes(32).toString('hex');
  User.update({email:email}, {$set:{reset_code:reset_code}}, function(err, result) {
    if (result.nModified > 0) {
      sendMail(email, reset_code);
    }
  });
  res.json({message:'ok'});
});

router.get('/info', passport.authenticate('bearer', {session:false}), function(req, res) {
  res.json({message:'ok'});
});

module.exports = router;
