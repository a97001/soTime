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
  Friendship = mongoose.model('Friendship'),
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

        event: (req, res, next, id) => {
          co(function*() {
            let event = null,
              goingEvent = null,
              me = new User(req.user);
            let eventResult = yield {
              event: Event.findOne({_id: id}).exec(),
              goingEvent: Event.findOne({_id: id, goings: me._id}).exec()
            };
            event = eventResult.event;
            goingEvent = eventResult.goingEvent;
            if (event) {
              req.event = event;
              if (event.host.toString() === req.user._id.toString()) {
                req.isEventHost = true;
              }
              if (goingEvent) {
                req.isGoingEvent = true;
              }
              if (event.friendship) {
                let friendship = null;
                friendship = yield Friendship.findOne({_id: event.friendship, users: me._id, status: 'accepted'}).exec();
                if (friendship) {
                  req.friendship = friendship;
                }
              }
              return next();
            }
            throw new CustomError("Event not exist", {err: 'Event not exist'}, 404);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        showEvent: (req, res, next) => {
          co(function*() {
            req.event = yield req.event.populate('group', 'name').populate('friendship', 'users').execPopulate();
            if (req.friendship) {
              yield User.populate(req.event, 'friendship.users', 'name');
            }
            let event = req.event.toObject(),
                groupPrivilege = req.groupPrivilege,
                group = req.group;
            delete event.banner;
            delete event.photos;
            delete event.votes;

            if (event.isPublic) {
              return res.json(event);
            } else if (event.group && group && groupPrivilege && (groupPrivilege === 'host' || groupPrivilege === 'member')) {
              return res.json(event);
            } else if (req.friendship) {
              return res.json(event);
            } else if (req.isGoingEvent) {
              return res.json(event);
            } else if (req.isEventHost && !event.group && !event.friendship) {
              return res.json(event);
            } else {
              throw new CustomError("Event not exist", {err: 'Event not exist'}, 404);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        updateEvent: (req, res, next) => {
          let event = req.event,
              groupPrivilege = req.groupPrivilege,
              group = req.group,
              friendship = req.friendship;
          if (event.group && group && req.isEventHost) {

          } else if (event.friendship && friendship) {

          } else if (req.isEventHost && !event.group && !event.friendship) {

          } else {
            throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
          }
        },

        deleteEvent: (req, res, next) => {
          let event = req.event,
              groupPrivilege = req.groupPrivilege,
              group = req.group,
              friendship = req.friendship;
          if (event.group && group && req.isEventHost) {

          } else if (event.friendship && friendship) {

          } else if (req.isEventHost && !event.group && !event.friendship) {

          } else {
            throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
          }
        }
    };
}
