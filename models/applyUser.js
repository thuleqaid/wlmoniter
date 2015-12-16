var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  first_name: {type:String},
  last_name: {type:String}
});

var ApplyUser = mongoose.model('ApplyUser', userSchema);

module.exports = ApplyUser;

