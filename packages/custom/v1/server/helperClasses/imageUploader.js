"use strict";

var mongoose = require('mongoose'),
  async = require("async"),
  Grid = require('gridfs-stream'),
  fs = require('fs'),
  sharp = require('sharp'),
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

function createImage(user, file, group, type, res, callback) {
  file.path = '/uploaded/files/' + user.email + '/' + file.name;
  let imageTransformer = sharp().resize(640, 640).max().rotate().progressive().quality(85).toFormat('jpeg');
  let fileReadStream = fs.createReadStream('/uploaded/files/' + user.email + '/' + file.name);

  let gridFile = {
      filename: file.name,
      content_type: file.type,
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
  fileReadStream.on('error', function (err) {
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
  fileReadStream.pipe(imageTransformer).pipe(gridFSWriteStream);
  // fileReadStream.pipe(gridFSWriteStream);
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

module.exports = createImage;
