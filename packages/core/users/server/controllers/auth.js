'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template'),
  _ = require('lodash'),
  moment = require('moment'),
  co = require('co'),
  jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken

var User = mongoose.model('User'),
    RefreshToken = mongoose.model('RefreshToken');

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        console.log(err);
        console.log(response);
        return response;
    });
}



module.exports = function(MeanUser) {
    return {
        /**
         * Auth callback
         */
        authCallback: function(req, res) {
          var payload = req.user;
          var escaped = JSON.stringify(payload);
          escaped = encodeURI(escaped);
          // We are sending the payload inside the token
          var token = jwt.sign(escaped, config.secret, { expiresIn: 600 });
          res.cookie('token', token);
          var destination = config.strategies.landingPage;
          if(!req.cookies.redirect)
            res.cookie('redirect', destination);
          res.redirect(destination);
        },

        /**
         * Show login form
         */
        signin: function(req, res) {
          if (req.isAuthenticated()) {
            return res.redirect('/');
          }
          res.redirect('/login');
        },

        /**
         * Logout
         */
        signout: function(req, res) {

            MeanUser.events.publish({
                action: 'logged_out',
                user: {
                    name: req.user.name
                }
            });

            RefreshToken.remove({_id: req.body.clientId, userId: req.user._id}, function(err,removed) {
                if (err) {
                    console.log(err);
                    return res.status(500).end();
                }
                req.logout();
                res.status(200).end();
                // res.redirect('/');
            });

        },

        /**
         * Session
         */
        session: function(req, res) {
          res.redirect('/');
        },

        /**
         * Create user
         */
        create: function(req, res, next) {
          co(function*() {
            var user = new User(req.body);
            user.provider = 'local';
            // because we set our user.provider to local our models/user.js validation will always be true
            // req.assert('name', 'You must enter a name').notEmpty();
            req.assert('email', 'You must enter a valid email address').isEmail();
            req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
            req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }
            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            try {
              yield user.save();
              console.log(1);
              var salt = crypto.randomBytes(16).toString('base64');
              var unhashedToken = crypto.randomBytes(20).toString('base64');
              var hashedToken = crypto.pbkdf2Sync(unhashedToken, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
              var isRememberme = false;
              var currentTime = moment.utc();
              // if (req.body.isRememberme === true) {
              //   isRememberme = true;
                currentTime.add(3, 'years');
              // } else {
              //   currentTime.add(1, 'days');
              // }
              var refreshToken = new RefreshToken({
                token: hashedToken,
                salt: salt,
                os: req.body.os,
                deviceName: req.body.deviceName,
                location: req.body.location,
                ip: req.ip,
                browser: req.body.browser,
                userId: user._id,
                expireAt: currentTime.toDate()
              });
              yield refreshToken.save();
              console.log(2);
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
            } catch (err) {
              switch (err.code) {
                  case 11000:
                  case 11001:
                  res.status(400).json([{
                      msg: 'Username already taken',
                      param: 'username'
                  }]);
                  break;
                  default:
                  var modelErrors = [];

                  if (err.errors) {

                      for (var x in err.errors) {
                          modelErrors.push({
                              param: x,
                              msg: err.errors[x].message,
                              value: err.errors[x].value
                          });
                      }

                      return res.status(400).json(modelErrors);
                  }
              }
              return res.status(400);
            }
          });
        },
        /**
         * Send User
         */
        me: function(req, res) {
            // if (!req.user || !req.user.hasOwnProperty('_id')) {
            //     return res.status(400).json({err: 'Invalid access token'});
            // }
            if (!req.body.refreshToken || !req.body.clientId) {
                return res.status(400).json({err: 'Missing refresh token or clientId'});
            }

            RefreshToken.findOne({_id: req.body.clientId}, function(err, refreshToken) {
                if (err) {
                    return res.status(500).end();
                }
                if (!refreshToken || !refreshToken.salt) {
                    return res.status(404).end();
                }

                var salt = refreshToken.salt;
                var unhashedToken = req.body.refreshToken;
                var hashedToken = crypto.pbkdf2Sync(unhashedToken, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
                if (hashedToken != refreshToken.token) {
                    return res.status(404).end();
                }
                User.findOne({
                    _id: refreshToken.userId
                }).exec(function(err, user) {
                    if (err || !user) return res.send(null);
                    refreshToken.ip = req.ip;
                    refreshToken.save(function(err, refreshToken) {
                        var payload = user.toJSON();
                        payload.redirect = req.body.redirect;
                        var currentTime = moment.utc();
                        payload.iat = currentTime.unix();
                        payload.ext = currentTime.add(1, 'days').unix();
                        var escaped = JSON.stringify(payload);
                        escaped = encodeURI(escaped);
                        // We are sending the payload inside the token
                        var token = jwt.sign(escaped, config.secret);
                        res.json({ accessToken: token});
                        //----------------------------------------------
                    });
                });
            });
        },

        /**
         * Find user by id
         */
        user: function(req, res, next, id) {
            User.findOne({
                _id: id
            }).exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.profile = user;
                next();
            });
        },

        /**
         * Resets the password
         */

        resetpassword: function(req, res, next) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        msg: 'Token invalid or expired'
                    });
                }
                req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
                req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {

                    MeanUser.events.publish({
                        action: 'reset_password',
                        user: {
                            name: user.name
                        }
                    });

                    req.logIn(user, function(err) {
                        if (err) return next(err);
                        return res.send({
                            user: user
                        });
                    });
                });
            });
        },

        /**
         * Callback for forgot password link
         */
        forgotpassword: function(req, res, next) {
            async.waterfall([

                function(done) {
                    crypto.randomBytes(20, function(err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function(token, done) {
                    User.findOne({
                        $or: [{
                            email: req.body.text
                        }, {
                            username: req.body.text
                        }]
                    }, function(err, user) {
                        if (err || !user) return done(true);
                        done(err, user, token);
                    });
                },
                function(user, token, done) {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                },
                function(token, user, done) {
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom
                    };
                    mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                    sendMail(mailOptions);
                    done(null, user);
                }
            ],
            function(err, user) {

                var response = {
                    message: 'Mail successfully sent',
                    status: 'success'
                };
                if (err) {
                    response.message = 'User does not exist';
                    response.status = 'danger';

                }
                MeanUser.events.publish({
                    action: 'forgot_password',
                    user: {
                        name: req.body.text
                    }
                });
                res.json(response);
            });
        },

        test: function(req, res) {
          var mailOptions = {
              to: 'a97001@gmail.com',
              from: config.emailFrom
          };
          mailOptions = templates.test(mailOptions);
          var transport = nodemailer.createTransport(config.mailer);
          // mailOptions.envelope =  {
          //     from: '"noreply" <noreply@negawatt.co>', // used as MAIL FROM: address for SMTP
          //     to: 'a97001@gmail.com, "a97001" <a97001@gmail.com>' // used as RCPT TO: address for SMTP
          // }

          transport.sendMail(mailOptions, function(err, info, response) {
              console.log(err);
              console.log(info);
              console.log(response);
              res.send('sent');
          });

        }
    }
}
