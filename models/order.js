var mongoose = require('mongoose');
var HistoryOrder = require('./historyOrder');

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
  valid: {type:Boolean, required:true, default:true}
});

orderSchema.pre('save', function(next) {
  this.__v += 1;
  return next();
});

orderSchema.post('save', function(order) {
  var histobj = order.toJSON();
  histobj.baseid = histobj._id;
  histobj.version = histobj.__v;
  delete histobj._id;
  new HistoryOrder(histobj).save(function(err) {});
});
var Order = mongoose.model('Order', orderSchema);

module.exports = Order;
