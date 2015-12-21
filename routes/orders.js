var express = require('express');
var Order = require('../models/order');
var passport = require('passport');

module.exports = function(io) {
  var router = express.Router();
  router.route('/')
    .get(passport.authenticate('bearer', {session:false}), function(req, res) {
      Order.find().sort('-date_create').exec(function(err, orders) {
        if (err) {
          res.send(err);
        }
        res.json(orders);
      });
    })
    .post(function(req, res, next) {
      passport.authenticate('bearer', {session:false}, function(err, token) {
        if (err) {
          return next(err);
        }
        if (!token) {
          return res.status(401).json({error:'wrong token'});
        }
        var order = new Order(req.body);
        /* set updater and update date */
        order.author = token.userid;
        order.date_create = Date.now();
        order.updater = order.author;
        order.date_update = order.date_create;
        /* save record */
        order.save(function(err) {
          if (err) {
            return res.send(err);
          }
          res.json({message:'Successful'});
          io.sockets.emit('table-order', {message:'add', id:order._id});
        });
      })(req, res, next);
    });
  router.route('/:id')
    .put(function(req, res, next) {
      passport.authenticate('bearer', {session:false}, function(err, token) {
        if (err) {
          return next(err);
        }
        if (!token) {
          return res.status(401).json({error:'wrong token'});
        }
        Order.findOne({_id:req.params.id}).exec(function(err, order) {
          if (err) {
            return res.send(err);
          }
          /* update each field of record */
          for (var prop in req.body) {
            order[prop] = req.body[prop];
          }
          /* set updater and update date */
          order.updater = token.userid;
          order.date_update = Date.now();
          /* save record */
          order.save(function(err) {
            if (err) {
              return res.send(err);
            }
            io.sockets.emit('table-order', {message:'chg', id:order._id});
            res.json({message:'Successful'});
          });
        });
      })(req, res, next);
    })
    .get(passport.authenticate('bearer', {session:false}), function(req, res) {
      Order.findOne({_id:req.params.id}).exec(function(err, order) {
        if (err) {
          return res.send(err);
        }
        res.json(order);
      });
    })
    .delete(function(req, res) {
      res.json({message:'Not Support'});
    });
  return router;
};

