const ls = require('passport-local').Strategy;
const fs = require('passport-facebook').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id); // set ID as cookie in the user's browser
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done); // get ID as cookie in the user's browser
  });

  passport.use('local-signin', new ls({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({email: email});
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success'));
      }
      return done(null, false, req.flash('danger'));
    } catch(err) {
      done(err);
    }
  }));

  passport.use(new fs({
    clientID : '12121212',
    clientSecret : '2323232323232323',
    profileFields : ['email', 'name']
  }, async (token, refreshToken, profile, done) => {
    console.log('Facebook', profile); 
    try {
      var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(email, picture, name, profile.name);
      var user = await User.findOne({'facebook.id': profile.id});
      if (!user) {
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
        }
        user.facebook.id = profile.id;
        user.facebook.photo = picture;
      }
      user.facebook.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));
};
