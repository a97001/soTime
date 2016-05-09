'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require("async"),
  Grid = require('gridfs-stream'),
  fs = require('fs'),
  // sharp = require('sharp'),
  formidable = require('formidable'),
  _ = require('lodash');

var Group = mongoose.model('Group'),
  Event = mongoose.model('Event'),
  FsFile = mongoose.model('FsFile'),
  User = mongoose.model('User');

var ObjectId = mongoose.Types.ObjectId;
Grid.mongo = mongoose.mongo;
var gfs = Grid(mongoose.connection.db, mongoose.mongo);

var zlib = require('zlib');
var gzip = zlib.createGzip();

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
        },

        allGroups: (req, res, next) => {
          co(function*() {
            let groups = [];
            try {
              groups = yield Group.find({members: req.user._id}, '-icon -followers -invitations').populate('members', 'name').lean().exec();
            } catch (err) {
              throw new Error({msg: err, code: 500});
            }
            return res.json(groups);
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
            try {
              groups = yield Group.find({followers: req.user._id, isPublic: true}, '-members -followers -invitations -authentication.identity -icon').lean().exec();
            } catch (err) {
              throw new Error({msg: err, code: 500});
            }
            return res.json(groups);
          });
        },

        showInvitedGroups: (req, res) => {
          co(function*() {
            let groups = [];
            try {
              groups = yield Group.find({invitations: req.user._id}, '-members -followers -invitations -authentication.identity -icon').lean().exec();
            } catch (err) {
              throw new Error({msg: err, code: 500});
            }
            return res.json(groups);
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
              delete group.members;
              delete group.invitations;
              delete group.authentication.identity;
            } else if (groupPrivilege === 'invitation') {
              delete group.members;
              delete group.invitations;
              delete group.authentication.identity;
            } else {
              delete group.members;
              delete group.followers;
              delete group.invitations;
              delete group.authentication.identity;
            }
            return res.json(group);
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
              try {
                yield Group.update({_id: group._id}, {$set: {name: req.body.name, isPublic: req.body.isPublic}}).exec();
                return res.status(204).end();
              } catch (err) {
                throw new Error({msg: err, code: 500});
              }
            } else {
              throw new Error({msg: 'Forbidden', code: 403});
            }
          });
        },

        exitGroup: (req, res) => {
          co(function*() {
            let group = req.group;
            if (req.groupPrivilege === 'host') {
              try {
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
              } catch (err) {
                throw new Error({msg: err, code: 500});
              }
            } else if (req.groupPrivilege === 'member') {
              try {
                yield Group.update({_id: group._id, host: group.host, memberCounter: {$gt: 1}, members: req.user._id}, {$pull: {members: req.user._id}, $inc: {memberCounter: -1}}).exec();
                return res.status(203).end();
              } catch (err) {
                throw new Error({msg: err, code: 500});
              }
            } else {
              throw new Error({msg: 'Forbidden', code: 403});
            }
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
                  'Content-Length' : fsFile.length
              });
              gfs.createReadStream({
                  _id: fsFile._id
              }).pipe(res);
            } else {

            }
          });
        },

        updateGroupIcon: (req, res, next) => {
          let group = req.group;
          if (req.groupPrivilege === 'member') {
            let form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
              let file = files.file;
              // let type = fields.type;
              // let documentId = fields.id;
              let user = new User(req.user);

              if (!file) {
                return res.status(400).json({error: "Missing files"});
              }
              // if (!type || !documentId) {
              //   return res.status(400).json({error: "Missing type or documentId"});
              // }
              createImage(user, file, group, 'icon', res, function(fsFile) {
                Group.update({_id: group._id}, {$set: {icon: fsFile._id}}, (err) => {
                  if (err) throw new Error({msg: err, code: 500});
                  res.status(201).end();
                });
              });
            });
          } else {
            throw new Error({msg: 'Forbidden', code: 403});
          }
        },

        showGroupFollowers: (req, res) => {
        },

        createGroupFollower: (req, res) => {
        },

        deleteGroupFollower: (req, res) => {
        },

        showGroupInvitations: (req, res) => {
        },

        createGroupInvitation: (req, res) => {
        },

        deleteGroupInvitation: (req, res) => {
        }
    };
}

function createImage(user, file, type, res, callback) {
  let imageTransformer = sharp().resize(640, 640).max().rotate().progressive().quality(70).toFormat('jpeg');
  let fileWriteStream = fs.createWriteStream(file.path);
  let gridFile = {
      filename: file.name,
      content_type: fileType,
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
