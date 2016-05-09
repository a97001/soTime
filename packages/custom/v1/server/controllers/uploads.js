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

/**
 * jQuery upload options
 */
var uploaderOptions = {
  tmpDir: '',
  uploadDir: '',
  uploadUrl: '/v1/upload/',
  useSSL: true,
  copyImgAsThumb: true,
  imageVersions: {
    width: 100,
    height: 'auto'
  },
  storage: {
    type: 'local'
  }
};

module.exports = function(FloorPlan) {

    return {
      /**
     * Filename param
     */
    filename: function(req, res, next, filename) {
      req.filename = filename;
      next();
    },


    /**
     * get document
     */
    getDoc: function(req, res) {
      var options = {
        root: '/uploaded/files/' + req.user.email + '/',
        dotfiles: 'deny'
      };
      res.sendFile(req.filename, options, function(err) {
        if (err) {
          console.log(err);
          return res.status(err.status).end();
        }
      });
    },

    /**
     * get document thumbnail
     */
    getDocThumbnail: function(req, res) {
      var options = {
        root: '/uploaded/files/' + req.user.email + '/thumbnail/',
        dotfiles: 'deny'
      };
      res.sendFile(req.filename, options, function(err) {
        if (err) {
          console.log(err);
          return res.status(err.status).end();
        }
      });
    },


    /**
     * get upload document
     */
    getUploadDocument: function(req, res) {
      uploaderOptions.tmpDir = '/uploaded/tmp/' + req.user.email;
      uploaderOptions.uploadDir = '/uploaded/files/' + req.user.email;
      var uploader = require('blueimp-file-upload-expressjs')(uploaderOptions);
      uploader.get(req, res, function(obj) {
        return res.send(JSON.stringify(obj));
      });
    },

    /**
     * post upload document
     */
    postUploadDocument: function(req, res) {
      uploaderOptions.tmpDir = '/uploaded/tmp/' + req.user.email;
      uploaderOptions.uploadDir = '/uploaded/files/' + req.user.email;
      var uploader = require('blueimp-file-upload-expressjs')(uploaderOptions);
      uploader.post(req, res, function(obj) {
        return res.send(JSON.stringify(obj));
      });
    },

    /**
     * delete upload document
     */
    deleteUploadDocument: function(req, res) {
      uploaderOptions.tmpDir = '/uploaded/tmp/' + req.user.email;
      uploaderOptions.uploadDir = '/uploaded/files/' + req.user.email;
      var uploader = require('blueimp-file-upload-expressjs')(uploaderOptions);
      uploader.delete(req, res, function(obj) {
        return res.send(JSON.stringify(obj));
      });
    },

    };
}
