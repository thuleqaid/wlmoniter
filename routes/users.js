var express = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');
var passport = require('passport');
var crypto = require('crypto');
var AccessToken = require('../models/accessToken');
var User = require('../models/user');
var router = express.Router();

var nodemailer = require('nodemailer');
var sendMail = function(to, reset_code) {
  var subject = process.env.MAIL_SUBJECT;
  var address = 'http://'+process.env.HOST+':'+process.env.PORT+'/user/changepassword?reset='+reset_code;
  var html = '<a href="'+address+'">Reset</a><br /><p>'+address+'</p>';
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
    AccessToken.remove({userid:user._id, clientid:'browser'}, function(err) {
      if (err) {
        /* console.log("Remove Error:"+err); */
      }
    });
    var random_token = crypto.randomBytes(32).toString('hex');
    var expires = moment().add(5, 'days').valueOf();
    var token = jwt.encode({iss:random_token,
                            exp:expires}, process.env.JWTSECRET);
    /* Add access token record */
    var access_token = new AccessToken({userid:user._id,
                                token:token
                               });
    access_token.save(function(err) {
      if (err) {
        return next(err);
      }
    });
    /* return JsonWebToken */
    res.json({token:token,
              expires:expires,
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
  AccessToken.remove({userid:req.body.userid, token:req.body.token}, function(err) { });
  res.json({message:'ok'});
});

router.route('/reset').post(function(req, res, next) {
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
