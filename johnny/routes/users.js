const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchErrors = require('../lib/async-error');

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}


function valform(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  var type = form.type || "";
  name = name.trim();
  email = email.trim();
  type = type.trim();

  if (!name) {
    return 'Name is needed';
  }
  if (!type) {
    return 'type is needed';
  }

  if (!email) {
    return 'Email is needed';
  }

  if (!form.password && options.needPassword) {
    return 'Password is needed';
  }

  if (form.password !== form.password_confirmation) {
    return 'Please match passwords';
  }

  return null;
}

/* GET users listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const users = await User.find({});
  res.render('users/index', {users: users});
}));

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit', {user: user});
}));

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  const err = valform(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger');
    return res.redirect('back');
  }

  if (!await user.validatePassword(req.body.current_password)) {
    req.flash('danger');
    return res.redirect('back');
  }
  

  user.name = req.body.name;
  user.email = req.body.email;
  user.type = req.body.type;
  if (req.body.password) {
    user.password = await user.generateHash(req.body.password);
  }
  await user.save();
  req.flash('success');
  res.redirect('/users');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success');
  res.redirect('/users');
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));

router.post('/', catchErrors(async (req, res, next) => {
  var err = valform(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({email: req.body.email});
  console.log('USER???', user);
  if (user) {
    req.flash('danger', 'Email address already exists.');
    return res.redirect('back');
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
    type: req.body.type,
  });
  user.password = await user.generateHash(req.body.password);
  await user.save();
  req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}));

module.exports = router;
