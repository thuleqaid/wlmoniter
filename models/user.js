var mongoose = require('mongoose');
var crypto = require('crypto');
var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  first_name: {type:String},
  last_name: {type:String},
  reset_code: {type:String, default:''}
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  var chksum = crypto.createHash('sha1');
  chksum.update(user.password);
  user.password = chksum.digest('hex');
  return next();
});

userSchema.methods.validatePassword = function(password) {
  var chksum = crypto.createHash('sha1');
  chksum.update(password);
  var result = (this.password == chksum.digest('hex'));
  return result;
};

// userSchema.statics.findByUsername = function(username, callback) {
//   this.findOne({email:username}).select('-password');
// };

var User = mongoose.model('User', userSchema);

/* initial data */
User.find(function(err, users) {
  if (users.length) {
    return;
  }
  new User({email:'quant@kotei-info.com',
            password:'kotei$88',
            first_name:'quan',
            last_name:'tian'}).save();
});

module.exports = User;

