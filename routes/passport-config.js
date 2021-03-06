var jwt = require('jwt-simple');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var AccessToken = require('../models/accessToken');
var User=require('../models/user');
module.exports = function(passport) {
  passport.use(new LocalStrategy(function(username, password, done) {
    /* console.log("passport-local-strategy:["+username+"]["+password+"]"); */
    User.findOne({email:username}, {'reset_code':0}, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message:'Incorrect username.'});
      }
      if (!user.validatePassword(password)) {
        return done(null, false, {message:'Incorrect password.'});
      }
      /* remove reset code if user can login by password */
      if (user.reset_code!="") {
        User.update({_id:user._id}, {$set:{reset_code:""}}, function(err) {});
      }
      user.password = '';
      return done(null, user);
    });
  }));
  passport.use(new BearerStrategy(function(token, cb) {
    /* console.log("passport-bearer-strategy:["+token+"]"); */
    try {
      var decoded = jwt.decode(token, process.env.JWTSECRET);
      if (decoded.exp <= Date.now()) {
        AccessToken.remove({userid:decoded.iss, token:decoded.jti},function(err) { });
        return cb(null, false);
      }
      AccessToken.findOne({userid:decoded.iss, token:decoded.jti}, function(err, access_token) {
        if (err) {
          /* console.log(err); */
          return cb(err);
        }
        if (!access_token) {
          return cb('No Permission');
        }
        return cb(null, access_token);
      });
    } catch(err) {
      /* console.log('decode error'); */
      return cb(err);
    }
  }));
  passport.serializeUser(function(user, done) {
    /* console.log("passport-serializeUser"); */
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    /* console.log("passport-deserializeUser"); */
    User.findById(id).select('-password').exec(function(err, user) {
      done(err, user);
    });
  });
};
