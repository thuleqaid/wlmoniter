var mongoose = require('mongoose');
var crypto = require('crypto');
var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  first_name: {type:String, required:true},
  last_name: {type:String, required:true},
  reset_code: {type:String, default:''},
  valid: {type:Boolean, required:true, default:true},
  enabler: {type:String, default:''},
  disabler: {type:String, default:''},
  permission: {type:[String], required:true, default:['modify']} /* modify/create/admin */
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
  result = result && this.valid;
  return result;
};

// userSchema.statics.findByUsername = function(username, callback) {
//   this.findOne({email:username}).select('-password');
// };

var User = mongoose.model('User', userSchema);

module.exports = User;

