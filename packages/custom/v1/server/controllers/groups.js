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
  _ = require('lodash'),
  CustomError = require('../helperClasses/customError'),
  ImageUploader = require('../helperClasses/imageUploader'),
  config = require('meanio').loadConfig();

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
          co(function*() {
            let me = new User(req.user);
            let group = null;
            if (req.event && req.event.group) { // check event group
              id = req.event.group;
            } else if (!id) {
              return next();
            }
            group = yield Group.findOne({_id: id, members: me._id}).exec();
            if (group) {
              req.group = group;
              if (group.host.toString() === me._id.toString()) {
                req.groupPrivilege = 'host';
              } else {
                req.groupPrivilege = 'member';
              }
              return next();
            }
            group = yield Group.findOne({_id: id, isPublic: true, followers: me._id}).exec();
            if (group) {
              req.group = group;
              req.groupPrivilege = 'follower';
              return next();
            }
            group = yield Group.findOne({_id: id, invitations: me._id}).exec();
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
            if (req.event) { //check event group
              req.groupPrivilege = 'unauthorized'
              return next();
            }
            throw new CustomError("Group not exist", {err: 'Group not exist'}, 404);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        allGroups: (req, res, next) => {
          co(function*() {
            let me = new User(req.user);
            let groups = [];
            groups = yield Group.find({members: req.user._id}, '-icon -followers -invitations').populate('members', 'name').lean().exec();
            return res.json(groups);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        createGroup: (req, res) => {
          let newGroup = req.body;
          req.checkBody('name', 'Name must be between 1-30 characters long').notEmpty().len(1, 30);
          req.checkBody('isPublic', 'isPublic must be boolean').notEmpty().isBoolean();
          var err = req.validationErrors();
          if (err) {
            return res.status(400).json(err);
          }
          newGroup.host = req.user._id;
          newGroup.members = [req.user._id];
          newGroup.memberCounter = 1;
          newGroup.followers = [];
          newGroup.followerCounter = 0;
          newGroup.invitations = [];
          newGroup.invitationCounter = 0;
          newGroup.icon = null;
          newGroup.hasIcon = false;
          newGroup.authentication = {
            isAuthenticated: false,
            identity: null
          }
          newGroup = new Group(newGroup);
          newGroup.save((err)=>{
            if (err) {
              console.log(err)
              return res.status(500).end();
            }
            res.status(201).json(newGroup);
          });
        },

        showFollowingGroups: (req, res) => {
          co(function*() {
            let groups = [];
            groups = yield Group.find({followers: req.user._id, isPublic: true}, '-members -followers -invitations -authentication.identity -icon').lean().exec();
            return res.json(groups);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        showInvitedGroups: (req, res) => {
          co(function*() {
            let groups = [];
            groups = yield Group.find({invitations: req.user._id}, '-members -followers -invitations -authentication.identity -icon').lean().exec();
            return res.json(groups);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        showGroup: (req, res) => {
          co(function*() {
            req.group = yield req.group.populate('members', 'username').populate('followers', 'name').populate('followers', 'name').execPopulate();
            let group = req.group.toObject(),
                groupPrivilege = req.groupPrivilege;
            delete group.icon;
            if (groupPrivilege === 'member' || groupPrivilege === 'host') {
            } else if (groupPrivilege === 'follower') {
              // delete group.members;
              delete group.invitations;
              delete group.authentication.identity;
            } else if (groupPrivilege === 'invitation') {
              // delete group.members;
              delete group.invitations;
              delete group.authentication.identity;
            } else {
              delete group.members;
              delete group.followers;
              delete group.invitations;
              delete group.authentication.identity;
            }
            return res.json(group);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        updateGroup: (req, res, next) => {
          co(function*() {
            let group = req.group;
            if (req.groupPrivilege === 'member') {
              req.checkBody('name', 'Name must be between 1-30 characters long').notEmpty().len(1, 30);
              req.checkBody('isPublic', 'isPublic must be boolean').notEmpty().isBoolean();
              var err = req.validationErrors();
              if (err) {
                return res.status(400).json(err);
              }
              yield Group.update({_id: group._id}, {$set: {name: req.body.name, isPublic: req.body.isPublic}}).exec();
              return res.status(204).end();
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        exitGroup: (req, res) => {
          co(function*() {
            let group = req.group;
            if (req.groupPrivilege === 'host') {
              if (group.memberCounter === 1) {
                yield Group.update({_id: group._id, host: req.user._id, memberCounter: 1}, {$set: {host: null}, $pull: {members: req.user._id}, $inc: {memberCounter: -1}}).exec();
                return res.status(203).end();
              } else if (group.memberCounter > 1) {
                let newHost = null;
                for (let i=0; i<group.memberCounter; i++) {
                  if (group.members[i].toString() !== group.host.toString()) {
                    newHost = group.members[i];
                    break;
                  }
                }
                yield Group.update({_id: group._id, host: req.user._id, memberCounter: {$gt: 1}, members: newHost}, {$set: {host: newHost}, $pull: {members: req.user._id}, $inc: {memberCounter: -1}}).exec();
                return res.status(203).end();
              }
            } else if (req.groupPrivilege === 'member') {
              yield Group.update({_id: group._id, host: group.host, memberCounter: {$gt: 1}, members: req.user._id}, {$pull: {members: req.user._id}, $inc: {memberCounter: -1}}).exec();
              return res.status(203).end();
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        showGroupIcon: (req, res) => {
          FsFile.findOne({_id: req.group.icon}).lean().exec((err, fsFile)=>{
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

        updateGroupIcon: (req, res, next) => {
          let group = req.group;
          if (req.groupPrivilege === 'member' || req.groupPrivilege === 'host') {
            let user = new User(req.user);
            let body = req.body;
            let files = body.uploadedDocs;
            ImageUploader(user, files[0], group, 'icon', res, function(fsFile) {
              Group.update({_id: group._id}, {$set: {icon: fsFile._id, hasIcon: true}}, (err) => {
                if (err) {
                  console.log(err);
                  return res.status(500).end();
                }
                res.status(201).end();
              });
            });

          } else {
            return res.status(403).end();
          }
        },

        allGroupEvents: (req, res, next) => {
          co(function*() {
            let groupEvents = [],
              me = new User(req.user);
            req.checkQuery('from', 'from is not a valid date').notEmpty().isDate();
            req.checkQuery('to', 'to is not a valid date').notEmpty().isDate();
            var err = req.validationErrors();
            if (err) {
              return res.status(400).json(err);
            }
            let groupPrivilege = req.groupPrivilege,
              group = req.group,
              query = {};
            if (groupPrivilege === 'host' || groupPrivilege === 'member' || group.isPublic) {
              query = {group: group._id, startTime: {$gte: new Date(req.query.from), $lte: new Date(req.query.to)}}
            } else {
              throw new CustomError('Forbidden', {err: 'Forbidden'}, 403);
            }
            if (req.query.type) {
              query.type = req.query.type;
            }
            // if (req.query.goingEvents) {
            //   query.$or = [{host: me._id, group: null, friendship: null}, {goings: me._id}];
            // } else {
            //   query.host = me._id;
            //   query.group = null;
            //   query.friendship = null;
            // }
            groupEvents = yield Event.find(query, 'title description type startTime allDay endTime venue isPublic').lean().exec();
            return res.json(groupEvents);
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        createGroupEvent: (req, res, next) => {
          let group = req.group,
            groupPrivilege = req.groupPrivilege,
            me = new User(req.user);
          let newEvent = req.body;
          req.checkBody('title', 'title must be between 1-50 characters long').notEmpty().len(1, 50);
          req.checkBody('description', 'description is not exist').notEmpty();
          req.checkBody('type', 'type is not exist').notEmpty();
          req.checkBody('startTime', 'startTime is not a valid date').notEmpty().isDate();
          req.checkBody('allDay', 'allDay must be boolean').notEmpty().isBoolean();
          req.checkBody('endTime', 'endTime is not a valid date').notEmpty().isDate();
          // req.checkBody('venue', 'venue object is not exist').notEmpty();
          req.checkBody('venue.coordinates.lat', 'venue.coordinates.lat is not a valid number').optional().isNumeric();
          req.checkBody('venue.coordinates.lat', 'venue.coordinates.lat is not a valid number').optional().isNumeric();
          // req.checkBody('venue.name', 'venue.name is not exist').notEmpty();
          req.checkBody('isPublic', 'isPublic must be boolean').notEmpty().isBoolean();
          var err = req.validationErrors();
          if (err) {
            return res.status(400).json(err);
          }
          newEvent.host = req.user._id;
          newEvent.group = group._id;
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

        showGroupFollowers: (req, res) => {
        },

        createGroupFollower: (req, res) => {
          co(function*() {
            let group = req.group;
            if (req.groupPrivilege === 'nonMember') {
              yield Group.update({_id: group._id, memberCounter: {$gt: 1}, isPublic: true, followers: {$ne: req.user._id}}, {$addToSet: {followers: req.user._id}, $inc: {followerCounter: 1}}).exec();
              return res.status(201).end();
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        deleteGroupFollower: (req, res) => {
          co(function*() {
            let group = req.group;
            if (req.groupPrivilege === 'follower') {
              yield Group.update({_id: group._id, memberCounter: {$gt: 1}, isPublic: true, followers:  req.user._id}, {$pull: {followers: req.user._id}, $inc: {followerCounter: -1}}).exec();
              return res.status(201).end();
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        showGroupInvitations: (req, res) => {
        },

        createGroupInvitation: (req, res) => {
          co(function*() {
            let group = req.group,
              inviteeType = req.body.inviteeType,
              invitee = req.body.invitee;
            if (req.groupPrivilege === 'host') {
              req.checkBody('inviteeType', 'inviteeType must be "user", "link" or "email"').notEmpty().isIn(['user', 'email', 'link']);
              if (inviteeType === 'user') {
                req.checkBody('invitee', 'inviteeType must be valid ObjectId').notEmpty().isMongoId();
              } else if (invitee === 'email') {
                req.checkBody('invitee', 'inviteeType must be valid email address').notEmpty().isEmail();
              }
              var err = req.validationErrors();
              if (err) {
                return res.status(400).json(err);
              }
              if (inviteeType === 'user') {
                let inviteeUser = yield User.findOne({_id: invitee}).lean().exec();
                if (!inviteeUser) throw new CustomError("Invitee not exist", {err: 'Invitee not exist'}, 400);
                yield Group.update({_id: group._id, host: req.user._id, invitations: {$ne: inviteeUser._id}, members: {$ne: inviteeUser._id}, followers: {$ne: inviteeUser._id}}, {$addToSet: {invitations: inviteeUser._id}, $inc: {invitationCounter: 1}}).exec();
                return res.status(201).end();
              } else if (inviteeType === 'email') {

              } else {
                let currentMoment = moment.utc(),
                  issueDate = Moment().toDate(),
                  expiryDate = Moment().add(3, 'days').toDate();
                let newNotification = new Notification({
                  type: 'GroupInvitation',
                  fromUser: req.user._id,
                  toUser: null,
                  isSystemMsg: false,
                  isDelivered: true,
                  issueDate: issueDate,
                  expiryDate: expiryDate,
                  content: {
                    group: group._id,
                    webLink: '/' + newNotification._id
                  }
                });
                yield newNotification.save();
                return res.status(201).json({webLink: newNotification.content.webLink});
              }
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        makeGroupInvitationDecision: (req, res) => {
          co(function*() {
            let group = req.group,
              decision = req.body.decision;
            if (req.groupPrivilege === 'invitation') {
              req.checkBody('decision', 'decision must be "accept" or "reject"').notEmpty().isIn(['accept', 'reject']);
              var err = req.validationErrors();
              if (err) {
                return res.status(400).json(err);
              }
              if (decision === 'accept') {
                yield Group.update({_id: group._id, memberCounter: {$gt: 1}, invitations: req.user._id, members: {$ne: req.user._id}, followers: {$ne: req.user._id}}, {$addToSet: {members: req.user._id}, $inc: {memberCounter: 1, invitationCounter: -1}}).exec();
              } else {
                yield Group.update({_id: group._id, memberCounter: {$gt: 1}, invitations: req.user._id, members: {$ne: req.user._id}, followers: {$ne: req.user._id}}, {$pull: {invitations: req.user._id}, $inc: {invitationCounter: -1}}).exec();
              }
              return res.status(203).end();
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        },

        deleteGroupInvitation: (req, res) => {
          co(function*() {
            let group = req.group,
              invitee = req.params.group_userId;
            if (req.groupPrivilege === 'host') {
              req.checkParams('group_userId', 'invitee in path must be valid ObjectId').notEmpty().isMongoId();
              var err = req.validationErrors();
              if (err) {
                return res.status(400).json(err);
              }
              let inviteeUser = yield User.findOne({_id: invitee}).lean().exec();
              if (!inviteeUser) throw new CustomError("Invitee not exist", {err: 'Invitee not exist'}, 400);
              yield Group.update({_id: group._id, host: req.user._id, invitations: inviteeUser._id, members: {$ne: inviteeUser._id}, followers: {$ne: inviteeUser._id}}, {$pull: {invitations: inviteeUser._id}, $inc: {invitationCounter: -1}}).exec();
              return res.status(201).end();
            } else {
              throw new CustomError("Forbidden", {err: 'Forbidden'}, 403);
            }
          }).catch(function (err) {
            config.errorHandler(err, res);
          });
        }
    };
}
