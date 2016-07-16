const mongoose = require('mongoose');
const co = require('co');
// const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const TwitterStrategy = require('passport-twitter').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const GitHubStrategy = require('passport-github').Strategy;
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// const LinkedinStrategy = require('passport-linkedin').Strategy;

const User = require('../server/models/user');

module.exports = (passport) => {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, (email, password, done) => {
      co(function* () {
        const regexString = `^${email}$`;
        const user = yield User.findOne({ email: { $regex: new RegExp(regexString, 'i') } }).exec();
        if (!user || !user.authenticate(password)) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user);
      }).catch((err) => {
        done(err);
      });
    }
  ));
};
