'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require("async"),
  Grid = require('gridfs-stream'),
  fs = require('fs'),
  // sharp = require('sharp'),
  co = require('co'),
  moment = require('moment'),
  formidable = require('formidable'),
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
          if (!otherUser) throw new Error({msg: 'User not exists', code: 404});
          req.otherUser = otherUser;
          return next();
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
                'Content-Length' : fsFile.length
            });
            gfs.createReadStream({
                _id: fsFile._id
            }).pipe(res);
          } else {

          }
        });
      },

      updateMyIcon: (req, res, next) => {},

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
        });
      },

      createFriendship: (req, res, next) => {
        co(function*() {
          yield Friendship.update({users: {$all: [req.user._id, otherUser._id]}}, {$setOnInsert: {users: [req.user._id, otherUser._id], date: new Date(), status: 'pending'}}, {upsert: true}).exec();
          return res.status(201).end();
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
        });
      },

      deleteFriendship: (req, res, next) => {
        co(function*() {
          yield Friendship.remove({users: {$all: [req.user._id, otherUser._id]}}).exec();
          return res.status(203).end();
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
                'Content-Length' : fsFile.length
            });
            gfs.createReadStream({
                _id: fsFile._id
            }).pipe(res);
          } else {

          }
        });
      }
    };
}

function createImage(user, file, type, res, callback) {
  let imageTransformer = sharp().resize(640, 640).max().rotate().progressive().quality(85).toFormat('jpeg');
  let fileWriteStream = fs.createWriteStream(file.path);
  let gridFile = {
      filename: file.name,
      content_type: 'jpg',
      metadata: {
        uploader: user._id,
        type: type,
        desc: "",
        attribute: {}
      },
      mode: 'w'
  };
  let gridFSWriteStream = gfs.createWriteStream(gridFile);
  gridFSWriteStream.pipe(imageTransformer).pipe(fileWriteStream);
  gridFSWriteStream.on('error', function (err) {
    removeFile(file, function() {
      console.log(err);
      return res.status(500).end();
    });
  });
  imageTransformer.on('error', function (err) {
    removeFile(file, function() {
      console.log(err);
      return res.status(500).end();
    });
  });
  fileWriteStream.on('error', function (err) {
    removeFile(file, function() {
      console.log(err);
      return res.status(500).end();
    });
  });
  gridFSWriteStream.on('close', function (fsFile) {
    removeFile(file, function() {
      callback(fsFile);
    });
  });
}

function removeFile(file, callback) {
  fs.exists(file.path, function (exists) {
    if (exists) {
      fs.unlink(file.path, function(err) {
        callback();
      });
    } else {
      callback();
    }
  });
}