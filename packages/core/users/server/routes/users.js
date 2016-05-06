'use strict';

var mongoose = require('mongoose'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken


var User = mongoose.model('User'),
    RefreshToken = mongoose.model('RefreshToken');

module.exports = function(MeanUser, app, auth, database, passport) {

  // User routes use users controller
  var users = require('../controllers/users')(MeanUser);
  // app.route('/auth/v1/test')
  //   .get(users.test);
  app.route('/v1/users/logout')
    .post(users.signout);
  app.route('/v1/users/me')
    .post(users.me);

  // app.route('/v1/users/me/permissions')
  //   .get(users.permissions);

  // app.route('/v1/users/me/packages')
  //   .get(users.checkUserPackages);

  // app.route('/auth/v1/users/me/userRoles')
  //   .get(users.checkUserRoles);

  // Setting up the userId param
  app.param('userId', users.user);

  // AngularJS route to check for authentication
  app.route('/v1/users/loggedin')
    .get(function(req, res) {
      if (!req.isAuthenticated()) return res.send('0');
      User.findById(req.user._id, function(user) {
        res.send(user ? user : '0');
      });
    });

  if(config.strategies.local.enabled)
  {
      // Setting up the users api
      app.route('/v1/users/register')
        .post(users.create);

      app.route('/v1/users/forgot-password')
        .post(users.forgotpassword);

      app.route('/v1/users/reset/:token')
        .post(users.resetpassword);

      // Setting the local strategy route
      app.route('/v1/users/login')
        .post(passport.authenticate('local', {
          failureFlash: false
        }), function(req, res) {
                var salt = crypto.randomBytes(16).toString('base64');
                var unhashedToken = crypto.randomBytes(20).toString('base64');
                var hashedToken = crypto.pbkdf2Sync(unhashedToken, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
                var isRememberme = false;
                var currentTime = moment.utc();
                if (req.body.isRememberme === true) {
                  isRememberme = true;
                  currentTime.add(3, 'years');
                } else {
                  currentTime.add(1, 'days');
                }
                var refreshToken = new RefreshToken({
                  token: hashedToken,
                  salt: salt,
                  os: req.body.os,
                  deviceName: req.body.deviceName,
                  location: req.body.location,
                  ip: req.ip,
                  browser: req.body.browser,
                  userId: req.user._id,
                  expireAt: currentTime.toDate()
                });
                refreshToken.save(function(err, refreshToken) {
                  if (err) {
                    console.log(err);
                    return res.status(500).end();
                  }
                  var payload = req.user.toJSON();
                  payload.redirect = req.body.redirect;
                  currentTime = moment.utc();
                  payload.iat = currentTime.unix();
                  payload.ext = currentTime.add(1, 'days').unix();
                  var escaped = JSON.stringify(payload);
                  escaped = encodeURI(escaped);
                  // We are sending the payload inside the token
                  var token = jwt.sign(escaped, config.secret);
                  res.json({clientId: refreshToken._id, accessToken: token, redirect: req.query.redirect, refreshToken: unhashedToken, isRememberme: isRememberme});
                });

        });
  }

  // AngularJS route to get config of social buttons
  app.route('/v1/users/get-config')
    .get(function (req, res) {
      // To avoid displaying unneccesary social logins
      var strategies = config.strategies;
      var configuredApps = {};
      for (var key in strategies)
      {
        if(strategies.hasOwnProperty(key))
        {
          var strategy = strategies[key];
          if (strategy.hasOwnProperty('enabled') && strategy.enabled === true) {
            configuredApps[key] = true ;
          }
        }
      }
      res.send(configuredApps);
    });

  if(config.strategies.facebook.enabled)
  {
      // Setting the facebook oauth routes
      app.route('/v1/auth/facebook')
        .get(passport.authenticate('facebook', {
          scope: ['email', 'user_about_me'],
          failureRedirect: '/auth/login',
        }), users.signin);

      app.route('/v1/auth/facebook/callback')
        .get(passport.authenticate('facebook', {
          failureRedirect: '/auth/login',
        }), users.authCallback);
  }

  if(config.strategies.github.enabled)
  {
      // Setting the github oauth routes
      app.route('/v1/auth/github')
        .get(passport.authenticate('github', {
          failureRedirect: '/auth/login'
        }), users.signin);

      app.route('/v1/auth/github/callback')
        .get(passport.authenticate('github', {
          failureRedirect: '/auth/login'
        }), users.authCallback);
  }

  if(config.strategies.twitter.enabled)
  {
      // Setting the twitter oauth routes
      app.route('/v1/auth/twitter')
        .get(passport.authenticate('twitter', {
          failureRedirect: '/auth/login'
        }), users.signin);

      app.route('/v1/auth/twitter/callback')
        .get(passport.authenticate('twitter', {
          failureRedirect: '/auth/login'
        }), users.authCallback);
  }

  if(config.strategies.google.enabled)
  {
      // Setting the google oauth routes
      app.route('/v1/auth/google')
        .get(passport.authenticate('google', {
          failureRedirect: '/auth/login',
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
          ]
        }), users.signin);

      app.route('/v1/auth/google/callback')
        .get(passport.authenticate('google', {
          failureRedirect: '/auth/login'
        }), users.authCallback);
  }

  if(config.strategies.linkedin.enabled)
  {
      // Setting the linkedin oauth routes
      app.route('/v1/auth/linkedin')
        .get(passport.authenticate('linkedin', {
          failureRedirect: '/auth/login',
          scope: ['r_emailaddress']
        }), users.signin);

      app.route('/v1/auth/linkedin/callback')
        .get(passport.authenticate('linkedin', {
          failureRedirect: '/auth/login'
        }), users.authCallback);
  }

};
