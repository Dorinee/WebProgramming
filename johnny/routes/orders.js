const express = require('express');
const order = require('../models/order');

const catchErrors = require('../lib/async-error');

const router = express.Router();

function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger');
        res.redirect('/signin');
    }
}

router.get('/', catchErrors(async (req, res, next) => {
  res.render('orders/index', {orders: orders});
}));


router.get('/new', needAuth, (req, res, next) => {
    res.render('orders/new', {order: {}});
  });
  

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    res.render('orders/edit', {order: order});
}));


router.get('/:id', catchErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('userID');
  
  await order.save();
  res.render('orders/show', {order: order});
}));

// routes>question 57.router.put('/:id')

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await Order.findOneAndRemove({_id: req.params.id});
    req.flash('success', 'Successfully deleted');
    res.redirect('/orders');
}));


router.post('/', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    require('mongoose-paginate');
    var Order = mongoose.model('Order', schema);
    var mongoose   = require('mongoose');

    var order = new Order({
      item: item._id,
      userID: user._id,
      people : req.body.people,
      tourDate : req.body.tourDate,
      totPrice : req.body.totPrice
      
    });
    await order.save();
    req.flash('success', 'Successfully posted');
    res.redirect('/orders');
  }));
  

module.exports = router;
  

