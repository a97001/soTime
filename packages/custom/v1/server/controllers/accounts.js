// 'use strict';
//
// /**
// * Module dependencies.
// */
// var mongoose = require('mongoose'),
// jwt = require('jsonwebtoken'),
// config = require('meanio').loadConfig(),
// async = require('async'),
// crypto = require('crypto'),
// nodemailer = require('nodemailer'),
// templates = require('../../../../core/users/server/template'),
// _ = require('lodash');
//
// var User = mongoose.model('User'),
// Role = mongoose.model('Role'),
// Company = mongoose.model('Company');
//
// var ObjectId = mongoose.Types.ObjectId;
//
// module.exports = function(FloorPlan) {
//
//   return {
//
//     account: function(req, res, next, id) {
//       if (req.user._id.toString() === id.toString() || req.user.isAdminUser) {
//         User.findOne({_id: id, company: req.user.company}, '-provider', function(err, account) {
//           if (err) return res.status(500).end();
//           if (!account) return res.status(404).end();
//           req.account = account;
//           next();
//         });
//       } else {
//         return res.status(403).json({err: 'User is not authorized'});
//       }
//     },
//
//     /**
//     * Create an account
//     */
//     create: (req, res) => {
//       let account = new User(req.body);
//
//       account.provider = 'local';
//
//       // because we set our user.provider to local our models/user.js validation will always be true
//       req.assert('name', 'You must enter a name').notEmpty();
//       req.assert('email', 'You must enter a valid email address').isEmail();
//       // req.assert('username', 'Username cannot be more than 20 characters').len(2, 50);
//
//       var errors = req.validationErrors();
//       if (errors) {
//           return res.status(400).send(errors);
//       }
//       if (!req.body.userRoles || !req.body.userRoles instanceof Array) {
//         return res.status(400).json({err: 'Missing userRoles in body'});
//       }
//       account.company = req.user.company;
//       account.username = account.name;
//
//       Role.find({_id: {$in: req.body.userRoles}, company: {$in: req.user.company}}).lean().exec(function(err, roles) {
//         if (err) {
//           return callback(err);
//         }
//         if (account.userRoles.length !== roles.length) {
//           return res.status(400).json({err: 'Invalid Roles'});
//         }
//         account.userRoles = req.body.userRoles;
//         // Hard coded for now. Will address this with the user permissions system in v0.3.5
//         account.roles = ['authenticated'];
//         account.password = crypto.randomBytes(8).toString('base64');
//         account.save(function(err) {
//             if (err) {
//                 switch (err.code) {
//                     case 11000:
//                     case 11001:
//                     res.status(400).json([{
//                         msg: 'Username already taken',
//                         param: 'username'
//                     }]);
//                     break;
//                     default:
//                     var modelErrors = [];
//
//                     if (err.errors) {
//
//                         for (var x in err.errors) {
//                             modelErrors.push({
//                                 param: x,
//                                 msg: err.errors[x].message,
//                                 value: err.errors[x].value
//                             });
//                         }
//
//                         res.status(400).json(modelErrors);
//                     }
//                 }
//                 return res.status(400);
//             }
//             var mailOptions = {
//                 to: account.email,
//                 from: config.emailFrom
//             };
//             mailOptions = templates.createAccount(account, account.password, mailOptions);
//             var transport = nodemailer.createTransport(config.mailer);
//             console.log(mailOptions);
//             transport.sendMail(mailOptions, function(err, info, response) {
//               if (err) {
//                 console.log(err);
//                 console.log(info);
//                 console.log(response);
//                 return res.status(500).json({err: 'Email cannot not be sent to user.'});
//               }
//               res.status(201).end();
//             });
//
//         });
//       });
//
//
//     },
//
//     /**
//     * Update an account
//     */
//     update: function(req, res) {
//       if (req.body.userRoles && !req.body.userRoles instanceof Array) {
//         return res.status(400).json({err: 'Missing roles in body or roles is not an array'});
//       }
//       var account = req.account;
//       var changes = req.body;
//       var update = {$set:{}};
//       async.series([
//         function(callback) {
//           if (changes.name) {
//             update.$set.name = changes.name;
//             callback(null);
//           } else {
//             callback(null);
//           }
//         },
//         function(callback) {
//           if (changes.username) {
//             update.$set.username = changes.username;
//             callback(null);
//           } else {
//             callback(null);
//           }
//         },
//         function(callback) {
//           if (changes.userRoles) {
//             Role.find({_id: {$in: changes.userRoles}, company: {$in: account.company}}).lean().exec(function(err, roles) {
//               if (err) {
//                 return callback(err);
//               }
//               if (changes.userRoles.length !== roles.length) {
//                 return callback('Invalid Roles');
//               }
//               update.$set.userRoles = changes.userRoles;
//               callback(null);
//             });
//           } else {
//             callback(null);
//           }
//         }
//       ], function (err, result) {
//           if (err) {
//             console.log(err);
//             return res.status(400).json({err: err});
//           } else {
//             if (Object.keys(update.$set).length > 0) {
//               User.update({_id: account._id}, update, function(err, user) {
//                 if (err) {
//                   console.log(err);
//                   return res.status(500).end();
//                 }
//                 res.status(204).end();
//               });
//             } else {
//               res.status(204).end();
//             }
//
//           }
//       });
//     },
//
//     /**
//     * Update roles of account
//     */
//     updateAccountRoles: function(req, res) {
//       var account = req.account;
//       var changedRoles = req.body.roles;
//       if (!changedRoles instanceof Array) {
//         return res.status(400).json({err: 'Missing roles in body or roles is not an array'});
//       }
//       async.each(changedRoles, function(changedRole, callback) {
//         Role.findOne({_id: changedRole, $and: [{company: {$in: account.company}}, {company: {$in: req.user.company}}]}).lean().exec(function(err, role) {
//           if (err) {
//             console.log(err);
//             return callback(err);
//           }
//           if (!role) {
//             return callback('Invalid role');
//           }
//           callback();
//         });
//       },
//       function(err) {
//         account.userRoles = changedRoles;
//         if (err) {
//           res.status(400).json(err);
//         } else {
//           account.save(function(err) {
//             if (err) {
//               return res.status(500).end();
//             }
//             res.status(204).end();
//           });
//         }
//       });
//     },
//
//     /**
//     * Delete an account
//     */
//
//     delete: function(req, res) {
//       var account = req.account;
//
//       account.remove(function(err) {
//         if (err) {
//           return res.status(500).end();
//         }
//         res.json(account.toJSON());
//
//       });
//     },
//
//     /**
//     * Show an account
//     */
//     show: function(req, res) {
//       res.json(req.account.toJSON());
//     },
//
//     /**
//     * List of accounts
//     */
//     all: function(req, res) {
//       User.find({company: {$in: req.user.company}}, '-hashed_password -salt -resetPasswordExpires -resetPasswordToken -provider').populate('company', 'name').populate('userRoles', 'name permissions').exec((err, accounts) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).end();
//         }
//         res.json(accounts);
//       });
//     },
//
//     getSessions: function(req, res) {
//       RefreshToken.find({userId: req.user._id}, '-token -salt -userId', (err, sessions) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).end();
//         }
//         res.json(sessions);
//       });
//     },
//
//     revokeToken: function(req, res) {
//       RefreshToken.remove({userId: req.user._id, clientId: req.params.clientId}, (err, removed) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).end();
//         }
//         res.json(removed);
//       });
//     },
//
//     checker: function(req, res) {
//       if (req.query.email) {
//         req.assert('email', 'You must enter a valid email address').isEmail();
//
//         var errors = req.validationErrors();
//         if (errors) {
//             return res.status(400).send(errors);
//         }
//         User.findOne({email: {$regex: req.query.email, $options: 'i'}}, '_id').lean().exec(function(err, user) {
//           if (err) {
//             console.log(err);
//             return res.status(500).end();
//           }
//           if (user) {
//             res.json({isEmailExists: true});
//           } else {
//             res.json({isEmailExists: false});
//           }
//         });
//       } else {
//         res.status(400).json({err: 'Invalid query string'});
//       }
//     },
//   };
// }
