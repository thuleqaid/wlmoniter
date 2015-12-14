var mongoose = require('mongoose');
var crypto = require('crypto');
var accessTokenSchema = mongoose.Schema({
  userid: {type:String, required:true},
  token: {type:String, required:true, unique:true},
  clientid: {type:String, reqired:true, default:'browser'}
});

var AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports = AccessToken;

