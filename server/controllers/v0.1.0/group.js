const co = require('co');
const moment = require('moment');
const imageUploader = require('../../helpers/ImageUploader');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const config = require('../../../config/env');

const User = require('../../models/user');
const FsFile = require('../../models/fsfile');
const Event = require('../../models/event');
const Group = require('../../models/group');

Grid.mongo = mongoose.mongo;
let gfs = null;
mongoose.connection.once('open', () => {
  gfs = new Grid(mongoose.connection.db);
});

module.exports = {
	/**
	 * Load group and append to req.
	 */
	load(req, res, next, id) {
		co(function* () {
			const group = yield Group.findById(id).exec();
			req.group = group;
			return next();
		}).catch((err) => {
			next(err);
		});
	},

  /**
   * Load group event
   */
  loadGroupEvent(req, res, next, id) {
    co(function* () {
      const event = yield Event.findOne({ _id: id, group_id: req.group._id }).exec();
      if (!event) {
        return res.status(404).end();
      }
      req.event = event;
      return next();
    }).catch((err) => {
      next(err);
    });
  },

	/**
	 * Get group
	 */
	showGroup(req, res) {
    if (!req.group.isPublic && req.groupPrivilege !== 'm') {
      return res.status(404).end();
    }
		return res.json(req.group);
	},

	/**
	 * Show all groups
	 */
	// showAllGroups(req, res, next) {
	// 	co(function* () {
	// 		const groups = yield Group.find({}).exec();
	// 		return res.json(groups);
	// 	}).catch((err) => {
	// 		next(err);
	// 	});
	// },

	/**
	 * Create group
	 */
	createGroup(req, res, next) {
		co(function* () {
			let newGroup = req.body;
			newGroup.host_id = req.me._id;
			newGroup.memberCounter = 1;
			newGroup.followerCounter = 0;
			newGroup.invitations_id = [];
			newGroup.invitationCounter = 0;
			newGroup.icon = null;
			newGroup.authentication = {
				isAuthenticated: false,
				identity: null
			};
			newGroup = new Group(newGroup);
			yield newGroup.save();
			yield User.update({ _id: req.me._id }, { $addToSet: { groups_id: newGroup._id } }).exec();
			return res.status(201).json(newGroup);
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Update group
	 */
	updateGroup(req, res, next) {
		co(function* () {
			if (req.group.host_id.toString() !== req.me._id.toString()) {
				return res.status(403).end();
			}
			const updates = Object.keys(req.body);
			for (let i = 0; i < updates.length; i++) {
				req.group[updates[i]] = req.body[updates[i]];
			}
			yield req.group.save();
			return res.json(req.group);
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Delete group
	 */
	deleteGroup(req, res, next) {
		co(function* () {
			if (req.group.host_id.toString() !== req.me._id.toString()) {
				return res.status(403).end();
			}
			yield Group.remove({ _id: req.group._id }).exec();
			yield User.update({ $or: [{ groups_id: req.group._id }, { follows_id: req.group._id }] }, { $pull: { groups_id: req.group._id, follows_id: req.group._id } }, { multi: true }).exec();
			return res.json({ _id: req.group._id });
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Show group icon
	 */
	showGroupIcon(req, res, next) {
		co(function* () {
			const fsFile = yield FsFile.findOne({ _id: req.group.icon, 'metadata.type': 'icon' }).lean().exec();
			if (fsFile) {
				res.writeHead(200, {
					'Content-Length': fsFile.length,
					'content-Type': fsFile.contentType
				});
				gfs.createReadStream({
					_id: fsFile._id
				}).pipe(res);
			} else {
				res.status(404).end();
			}
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Update group icon
	 */
	updateGroupIcon(req, res, next) {
		co(function* () {
			if (req.groupPrivilege !== 'm') {
				return res.status(403).end();
			}
			const me = new User(req.me);
			const body = req.body;
			const files = body.uploadedDocs;
			imageUploader(me, files[0], req.group, 'icon', res, (fsFile) => {
				Group.update({ _id: req.group._id }, { $set: { icon: fsFile._id } }, (err) => {
					if (err) {
						console.log(err);
						return res.status(500).end();
					}
					return res.status(201).json({ icon: fsFile._id });
				});
			});
			return 0;
		}).catch((err) => {
			next(err);
		});
	},

  /**
   * Invite group member
   */
  inviteGroupMember(req, res, next) {
    co(function* () {
      if (req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      const result = yield User.update({ _id: req.body.user, groups_id: { $ne: req.group._id } }, { $addToSet: { groupInvitations_id: req.group._id } }).exec();
      if (result.nModified === 1) {
        return res.json({ invitedUser: req.body.user });
      }
      return res.status(400).end();
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Show invited users
   */
  showInvitedUsers(req, res, next) {
    co(function* () {
      if (req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      const invitedUsers = yield User.find({ groupInvitations_id: req.group._id }, '_id username').lean().exec();
      return res.json(invitedUsers);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Disinvite group member
   */
  disinviteGroupMember(req, res, next) {
    co(function* () {
      if (req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      const result = yield User.update({ _id: req.params.invitation_userId }, { $pull: { groupInvitations_id: req.group._id } }).exec();
      if (result.nModified === 1) {
        return res.json({ disinvitedUser: req.params.invitation_userId });
      }
      return res.status(400).end();
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Create group event
   */
  createGroupEvent(req, res, next) {
    co(function* () {
      if (req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      let groupMembers = yield User.aggregate([
        { $match: { groups_id: req.group._id } },
        { $group: {
          _id: null,
          members: { $push: '$_id' }
        } }
      ]).exec();
      if (groupMembers && groupMembers[0] && groupMembers[0].members) {
        groupMembers = groupMembers[0].members;
      }
      let newEvent = req.body;
      newEvent.user_id = req.me._id;
      newEvent.group_id = req.group._id;
      newEvent.friendship_id = null;
      newEvent.participants_id = groupMembers;
      newEvent.participantCounter = groupMembers.length;
      newEvent.goings_id = [];
      newEvent.goingCounter = 0;
      newEvent.notGoings_id = [];
      newEvent.notGoingCounter = 0;
      newEvent.votes = [];
      newEvent.totalVoteCounter = 0;
      newEvent.voteStart = null;
      newEvent.voteEnd = null;
      newEvent.banner = null;
      newEvent.photos_id = [];
      newEvent = new Event(newEvent);
      yield newEvent.save();
      return res.status(201).json(newEvent);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Show group events
   */
  showGroupEvents(req, res, next) {
    co(function* () {
      if (!req.group.isPublic && req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      let events = [];
      let query = null;
      if (req.groupPrivilege === 'm') {
        query = { group_id: req.group._id, friendship_id: null, startTime: { $lte: new Date(req.query.to) }, endTime: { $gte: new Date(req.query.from) }, $or: [{ participants_id: req.me._id }, { isPublic: true }] };
      } else {
        query = { group_id: req.group._id, friendship_id: null, startTime: { $lte: new Date(req.query.to) }, endTime: { $gte: new Date(req.query.from), isPublic: true } };
      }
      if (req.query.type) {
        query.type = req.query.type;
      }
      events = yield Event.find(query, 'title description type startTime allDay endTime venue isPublic').lean().exec();
      return res.json(events);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Update group event
   */
  updateGroupEvent(req, res, next) {
    co(function* () {
      if (req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      let newEvent = req.body;
      newEvent.user_id = req.event.user_id;
      newEvent.group_id = req.event.group_id;
      newEvent.friendship_id = null;
      newEvent.participants_id = req.event.participants_id;
      newEvent.participantCounter = req.event.participantCounter;
      newEvent.goings_id = req.event.goings_id;
      newEvent.goingCounter = req.event.goingCounter;
      newEvent.notGoings_id = req.event.notGoings_id;
      newEvent.notGoingCounter = req.event.notGoingCounter;
      newEvent.votes = req.event.votes;
      newEvent.totalVoteCounter = req.event.totalVoteCounter;
      newEvent.voteStart = req.event.voteStart;
      newEvent.voteEnd = req.event.voteEnd;
      newEvent.banner = req.event.banner;
      newEvent.photos_id = req.event.photos_id;
      newEvent = new Event(newEvent);
      yield newEvent.save();
      return res.json(newEvent);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Delete group event
   */
  deleteGroupEvent(req, res, next) {
    co(function* () {
      if (req.groupPrivilege !== 'm') {
        return res.status(403).end();
      }
      yield Event.remove({ _id: req.event._id, group_id: req.group._id, friendship_id: null }).exec();
      return res.json({ _id: req.event._id });
    }).catch((err) => {
      next(err);
    });
  }

};
