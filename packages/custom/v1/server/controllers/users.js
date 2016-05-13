'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require("async"),
  Grid = require('gridfs-stream'),
  fs = require('fs'),
  co = require('co'),
  moment = require('moment'),
  CustomError = require('../helperClasses/customError'),
  ImageUploader = require('../helperClasses/imageUploader'),
  _ = require('lodash');

var Group = mongoose.model('Group'),
  Event = mongoose.model('Event'),
  Notification = mongoose.model('Notification'),
  FsFile = mongoose.model('FsFile'),
  Friendship = mongoose.model('Friendship'),
  User = mongoose.model('User');

var ObjectId = mongoose.Types.ObjectId;
Grid.mongo = mongoose.mongo;
var gfs = Grid(mongoose.connection.db, mongoose.mongo);

// var zlib = require('zlib');
// var gzip = zlib.createGzip();

module.exports = function(FloorPlan) {

    return {
      user: (req, res, next, id) => {
        co(function*() {
          let otherUser = null;
          otherUser = yield User.findOne({_id: id, status: {$nin: ['deleted']}}).exec();
          if (!otherUser) throw new CustomError("User not exist", {err: 'User not exist'}, 404);
          req.otherUser = otherUser;
          return next();
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      friendship: (req, res, next, id) => {
        co(function*() {
          let otherUser = null,
            friendship = null;
          otherUser = yield User.findOne({_id: id, status: {$nin: ['deleted']}}).exec();
          if (!otherUser) throw new CustomError("User not exist", {err: 'User not exist'}, 404);
          friendship = yield Friendship.findOne({users: {$all: [req.user._id, otherUser._id]}, status: 'accepted'}).exec();
          if (!friendship) throw new CustomError("Friend not exist", {err: 'Friend not exist'}, 404);
          req.otherUser = otherUser;
          req.friendship = friendship;
          return next();
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      searchUsers: (req, res, next) => {
        co(function*() {
          let otherUsers = [];
          req.checkBody('keyword', 'You must enter a valid email address').isEmail();
          var errors = req.validationErrors();
          if (errors) {
              otherUsers = yield User.find({username: {$regex: '^'+req.body.keyword, $options: 'i'}, status: {$nin: ['deleted']}}, 'name email').exec();
          } else {
            otherUsers = yield User.find({email: {$regex: '^'+req.body.keyword, $options: 'i'}, status: {$nin: ['deleted']}}, 'name email').exec();
          }
          return res.json(otherUsers);
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      // showMe: (req, res, next) => {},

      updateMe: (req, res, next) => {
        co(function*() {
          var me = req.body;

          req.checkBody('email', 'You must enter a valid email address').notEmpty().isEmail();
          req.checkBody('username', 'username cannot be more than 20 characters').notEmpty().len(1, 20);
          // req.assert('gender', 'gender must be ').isBoolean();
          req.checkBody('date', 'date must be a date').isDate();

          var errors = req.validationErrors();
          if (errors) {
              return res.status(400).send(errors);
          }
          // Hard coded for now. Will address this with the user permissions system in v0.3.5
          req.user.email = me.email;
          req.user.username = me.username;
          req.user.birthday = me.birthday;

          try {
            yield req.user.save();
            // req.user = user;
            console.log(1);
            let payload = req.user.toJSON();
            let currentTime = moment.utc();
            payload.iat = currentTime.unix();
            payload.ext = currentTime.add(1, 'days').unix();
            let escaped = JSON.stringify(payload);
            escaped = encodeURI(escaped);
            // We are sending the payload inside the token
            let token = jwt.sign(escaped, config.secret);
            console.log(3);
            return res.json({accessToken: token});
            console.log(4);
          } catch (err) {
            console.log(err);
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
            return res.status(500).end();
          }
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      deleteMe: (req, res, next) => {},

      showMyIcon: (req, res, next) => {
        FsFile.findOne({_id: req.user.icon}).lean().exec((err, fsFile)=>{
          if (err) {
            console.log(err);
            return res.status(500).end();
          }
          if (fsFile) {
            res.writeHead(200, {
                'Content-Length' : fsFile.length,
                'content-Type': fsFile.contentType
            });
            gfs.createReadStream({
                _id: fsFile._id
            }).pipe(res);
          } else {
            return res.status(404).end();
          }
        });
      },

      updateMyIcon: (req, res, next) => {
        let me = new User(req.user);
        let body = req.body;
        let files = body.uploadedDocs;
        ImageUploader(me, files[0], group, 'icon', res, function(fsFile) {
          User.update({_id: me._id}, {$set: {icon: fsFile._id, hasIcon: true}}, (err) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            res.status(201).end();
          });
        });
      },

      allMyEvents: (req, res, next) => {
        co(function*() {
          let myEvents = [],
            me = new User(req.user);
          req.checkQuery('from', 'from is not a valid date').notEmpty().isDate();
          req.checkQuery('to', 'to is not a valid date').notEmpty().isDate();
          var err = req.validationErrors();
          if (err) {
            return res.status(400).json(err);
          }
          if (req.query.type) {
            myEvents = yield Event.find({host: me._id, group: null, friendship: null, startTime: {$gte: new Date(req.query.from), $lte: new Date(req.query.to)}, type: req.query.type}, 'title description type startTime allDay endTime venue isPublic').lean().exec();
          } else {
            myEvents = yield Event.find({host: me._id, group: null, friendship: null, startTime: {$gte: new Date(req.query.from), $lte: new Date(req.query.to)}}, 'title description type startTime allDay endTime venue isPublic').lean().exec();
          }
          return res.json(myEvents);
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      createMyEvent: (req, res, next) => {
        let newEvent = req.body;
        req.checkBody('title', 'title must be between 1-50 characters long').notEmpty().len(1, 50);
        req.checkBody('description', 'description is not exist').notEmpty();
        req.checkBody('type', 'type is not exist').notEmpty();
        req.checkBody('startTime', 'startTime is not a valid date').notEmpty().isDate();
        req.checkBody('allDay', 'allDay must be boolean').notEmpty().isBoolean();
        req.checkBody('endTime', 'endTime is not a valid date').notEmpty().isDate();
        // req.checkBody('venue', 'venue object is not exist').optional().notEmpty();
        req.checkBody('venue.coordinates.lat', 'venue.coordinates.lat is not a valid number').optional().isNumeric();
        req.checkBody('venue.coordinates.lat', 'venue.coordinates.lat is not a valid number').optional().isNumeric();
        // req.checkBody('venue.name', 'venue.name is not exist').optional().notEmpty();

        var err = req.validationErrors();
        if (err) {
          return res.status(400).json(err);
        }
        newEvent.host = req.user._id;
        newEvent.group = null;
        newEvent.friendship = null;
        newEvent.participants = [];
        newEvent.participantCounter = 0;
        newEvent.goings = [];
        newEvent.goingCounter = 0;
        newEvent.notGoings = [];
        newEvent.notGoingCounter = 0;
        newEvent.votes = [];
        newEvent.totalVoteCounter = 0;
        newEvent.voteStart = null;
        newEvent.voteEnd = null;
        newEvent.isPublic = false;
        newEvent.banner = null;
        newEvent.hasBanner = false;
        newEvent.photos = [];

        newEvent = new Event(newEvent);
        newEvent.save((err)=>{
          if (err) {
            console.log(err)
            return res.status(500).end();
          }
          res.status(201).json(newEvent);
        });
      },

      showMyFriendships: (req, res, next) => {
        co(function*() {
          let results = [],
            user = new User(req.user);
          results = yield Friendship.aggregate([
            { "$match": {users: user._id}},
            { "$unwind": "$users"},
            { "$match": {users: {$ne: user._id}}},
            { "$group": {
                "_id": null,
                "friends": {
                    "$addToSet": '$users'
                }
            }},
          ]).exec();
          if (!results || !results[0]) return res.json([]);
          let friends = [];
          friends = yield User.find({_id: {$in: results[0].users}, status: 'activated'}, 'name email').lean().exec();
          return res.json(friends);
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      createFriendship: (req, res, next) => {
        co(function*() {
          yield Friendship.update({users: {$all: [req.user._id, otherUser._id]}}, {$setOnInsert: {users: [req.user._id, otherUser._id], date: new Date(), status: 'pending'}}, {upsert: true}).exec();
          return res.status(201).end();
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      makeFriendshipDecision: (req, res, next) => {
        co(function*() {
          req.checkBody('decision', 'decision must be "accept" or "reject"').notEmpty().isIn(['accept', 'reject']);
          var err = req.validationErrors();
          if (err) {
            return res.status(400).json(err);
          }
          let decision = req.body.decision;
          if (decision === 'accept') {
            yield Friendship.update({users: {$all: [req.user._id, otherUser._id]}, status: 'pending'}, {$set: {status: 'accepted', date: new Date()}}).exec();
          } else {
            yield Friendship.remove({users: {$all: [req.user._id, otherUser._id]}, status: 'pending'}).exec();
          }
          return res.status(203).end();
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      deleteFriendship: (req, res, next) => {
        co(function*() {
          yield Friendship.remove({users: {$all: [req.user._id, otherUser._id]}}).exec();
          return res.status(203).end();
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      allFriendshipEvents: (req, res, next) => {
        co(function*() {
          let friendshipEvents = [],
            me = new User(req.user);
          req.checkQuery('from', 'from is not a valid date').notEmpty().isDate();
          req.checkQuery('to', 'to is not a valid date').notEmpty().isDate();
          var err = req.validationErrors();
          if (err) {
            return res.status(400).json(err);
          }
          if (req.query.type) {
            friendshipEvents = yield Event.find({friendship: req.friendship._id, startTime: {$gte: new Date(req.query.from), $lte: new Date(req.query.to)}, type: req.query.type}, 'title description type startTime allDay endTime venue isPublic').lean().exec();
          } else {
            friendshipEvents = yield Event.find({friendship: req.friendship._id, endTime: {$gte: new Date(req.query.from), $lte: new Date(req.query.to)}}, 'title description type startTime allDay endTime venue isPublic').lean().exec();
          }
          return res.json(friendshipEvents);
        }).catch(function (err) {
          config.errorHandler(err, res);
        });
      },

      createFriendshipEvent: (req, res, next) => {
        let newEvent = req.body;
        req.checkBody('title', 'title must be between 1-50 characters long').notEmpty().len(1, 50);
        req.checkBody('description', 'description is not exist').notEmpty();
        req.checkBody('type', 'type is not exist').notEmpty();
        req.checkBody('startTime', 'startTime is not a valid date').notEmpty().isDate();
        req.checkBody('allDay', 'allDay must be boolean').notEmpty().isBoolean();
        req.checkBody('endTime', 'endTime is not a valid date').notEmpty().isDate();
        // req.checkBody('venue', 'venue object is not exist').notEmpty();
        req.checkBody('venue.coordinates.lat', 'venue.coordinates.lat is not a valid number').optional().isNumeric();
        req.checkBody('venue.coordinates.lon', 'venue.coordinates.lon is not a valid number').optional().isNumeric();
        // req.checkBody('venue.name', 'venue.name is not exist').notEmpty();
        req.checkBody('isPublic', 'isPublic must be boolean').notEmpty().isBoolean();
        var err = req.validationErrors();
        if (err) {
          return res.status(400).json(err);
        }
        newEvent.host = req.user._id;
        newEvent.group = null;
        newEvent.friendship = req.friendship._id;
        newEvent.participants = [];
        newEvent.participantCounter = 0;
        newEvent.goings = req.friendship.users;
        newEvent.goingCounter = 2;
        newEvent.notGoings = [];
        newEvent.notGoingCounter = 0;
        newEvent.votes = [];
        newEvent.totalVoteCounter = 0;
        newEvent.voteStart = null;
        newEvent.voteEnd = null;
        newEvent.banner = null;
        newEvent.hasBanner = false;
        newEvent.photos = [];

        newEvent = new Event(newEvent);
        newEvent.save((err)=>{
          if (err) {
            console.log(err)
            return res.status(500).end();
          }
          res.status(201).json(newEvent);
        });
      },

      showUser: (req, res, next) => {
        let otherUser = {
          _id: req.otherUser._id,
          gender: req.otherUser.gender,
          birthday: req.otherUser.birthday,
          username: req.otherUser.username,
          email: req.otherUser.email
        }
        return res.json(otherUser);
      },

      showUserIcon: (req, res, next) => {
        FsFile.findOne({_id: req.otherUser.icon}).lean().exec((err, fsFile)=>{
          if (err) {
            console.log(err);
            return res.status(500).end();
          }
          if (fsFile) {
            res.writeHead(200, {
                'Content-Length' : fsFile.length,
                'content-Type': fsFile.contentType
            });
            gfs.createReadStream({
                _id: fsFile._id
            }).pipe(res);
          } else {
            return res.status(404).end();
          }
        });
      }
    };
}
