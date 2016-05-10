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
  User = mongoose.model('User');

var ObjectId = mongoose.Types.ObjectId;
Grid.mongo = mongoose.mongo;
var gfs = Grid(mongoose.connection.db, mongoose.mongo);

// var zlib = require('zlib');
// var gzip = zlib.createGzip();

module.exports = function(FloorPlan) {

    return {

        group: (req, res, next, id) => {
          let group = null;
          co(function*() {
            group = yield Group.findOne({_id: id, members: req.user_id}).exec();
            if (group) {
              req.group = group;
              if (group.host.toString() === req.user._id.toString()) {
                req.groupPrivilege = 'host';
              } else {
                req.groupPrivilege = 'member';
              }
              return next();
            }
            group = yield Group.findOne({_id: id, isPublic: true, followers: req.user_id}).exec();
            if (group) {
              req.group = group;
              req.groupPrivilege = 'follower';
              return next();
            }
            group = yield Group.findOne({_id: id, invitations: req.user_id}).exec();
            if (group) {
              req.group = group;
              req.groupPrivilege = 'invitation';
              return next();
            }
            group = yield Group.findOne({_id: id, isPublic: true}).exec();
            if (group) {
              req.group = group;
              req.groupPrivilege = 'nonMember';
              return next();
            }
            throw new Error({msg: 'Group not exists', code: 404});
          });
        }
    };
}

function createImage(user, file, type, res, callback) {
  let imageTransformer = sharp().resize(640, 640).max().rotate().progressive().quality(85).toFormat('jpeg');
  let fileWriteStream = fs.createWriteStream('/uploaded/files/' + user.email + '/' + file.name);
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
  console.log(gridFile);
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
    console.log('test');
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
