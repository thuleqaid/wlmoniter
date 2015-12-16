var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  customer: {type:String, required:true},
  name_c: {type:String, default:''},
  name_k: {type:String, default:''},
  nda: {type:Boolean, default:true},
  contract: {type:Boolean, default:false},
  quantity: {type:Number, default:0},
  date_start: {type:Date},
  date_end: {type:Date},
  memo: {type:String, default:''},
  author: {type:String, required:true},
  date_create: {type:Date, required:true},
  updater: {type:String, required:true},
  date_update: {type:Date, required:true},
  valid: {type:Boolean, required:true, default:true},
  version: {type:Number, required:true}
});

orderSchema.pre('save', function(next) {
  this.__v += 1;
  return next();
});
var HistoryOrder = mongoose.model('HistoryOrder', orderSchema);

module.exports = HistoryOrder;
