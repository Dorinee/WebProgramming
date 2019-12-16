const express = require('express');
const Item = require('../models/item');
const Comment = require('../models/comment');
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  var query = {};
  const term = req.query.term;
  if (term) {
      query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const items = await Item.paginate(query, {
      sort: {createdAt: -1}, 
      populate: 'userID', 
      page: page, 
      limit: limit
  });
  res.render('items/index', {items: items, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('items/new', {item: {}});
});
  

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  res.render('items/edit', {item: item});
}));
  
router.get('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('userID');
  const comments = await Comment.find({item: item.id}).populate('userID');
  

  await item.save();
  res.render('items/show', {item: item, comments: comments});
}));
  
// 
router.post('/:id', catchErrors(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger');
    return res.redirect('back');
  }
  item.title = req.body.title;
  item.content = req.body.content;
  item.course = req.body.course;
  item.place = req.body.place;
  item.price = req.body.price;      
    
  await item.save();
  req.flash('success');
  res.redirect('/items');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Item.findOneAndRemove({_id: req.params.id});
  req.flash('success');
  res.redirect('/items');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var item = new Item({
    title: req.body.title,
    userID: user._id,
    content: req.body.content,
    course : req.body.course,
    place : req.body.place,
    price : req.body.price      
  });
  await item.save();
  req.flash('success');
  res.redirect('/items');
}));
  
router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const item = await Item.findById(req.params.id);

  if (!item) {
    req.flash('danger');
    return res.redirect('back');
  }

  var comment = new Comment({
    userID: user._id,
    item: item._id,
    content: req.body.content,
    starScore: req.body.starScore
  });
  await comment.save();
  item.numComments++;
  await item.save();

  req.flash('success');
  res.redirect(`/items/${req.params.id}`);
}));
  


module.exports = router;
  