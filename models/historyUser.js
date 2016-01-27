var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
  email: {type:String, required:true},
  password: {type:String, required:true},
  first_name: {type:String, required:true},
  last_name: {type:String, required:true},
  gender: {type:String, default:'male'},
  workid: {type:String, default:''},
  reset_code: {type:String, default:''},
  permission: {type:[String], required:true, default:['modify']}, /* modify/create/admin */
  valid: {type:Boolean, required:true, default:true},
  salary: {type: {
    base: {type:Number, default: 0}
  }},
  updater: {type:String, default:''},
  date_update: {type:Date, required:true},
  baseid: {type:String},
  version: {type:Number, required:true}
});

var HistoryUser = mongoose.model('HistoryUser', userSchema);

module.exports = HistoryUser;
