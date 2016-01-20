var mongoose = require('mongoose');
var HistoryUser = require('./historyUser');
var crypto = require('crypto');
var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  first_name: {type:String, required:true},
  last_name: {type:String, required:true},
  workid: {type:String, default:''},
  reset_code: {type:String, default:''},
  permission: {type:[String], required:true, default:['modify']}, /* modify/create/admin */
  valid: {type:Boolean, required:true, default:true},
  salary: {type: {
    base: {type:Number, default: 0}
  }},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true}
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  var chksum = crypto.createHash('sha1');
  chksum.update(user.password);
  user.password = chksum.digest('hex');
  this.__v += 1;
  return next();
});

userSchema.post('save', function(user) {
  var histobj = user.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryUser(histobj).save(function(err) {console.log(err);});
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

