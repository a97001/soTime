const co = require('co');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const UaParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const crypto = require('crypto');
const imageUploader = require('../../helpers/ImageUploader');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('../../../config/env');

const User = require('../../models/user');
const FsFile = require('../../models/fsfile');
const RefreshToken = require('../../models/refreshToken');
const Event = require('../../models/event');

Grid.mongo = mongoose.mongo;
// console.log(mongoose.mongo);
let gfs = null;
mongoose.connection.once('open', () => {
  gfs = new Grid(mongoose.connection.db);
});

const objectId = mongoose.Types.ObjectId;

module.exports = {
	/**
	 * Load user and append to req.
	 */
	load(req, res, next, id) {
		co(function* () {
			const user = yield User.findById(id).exec();
			req.user = user;
			return next();
		}).catch((err) => {
			next(err);
		});
	},

  /**
   * Load user event
   */
  loadUserEvent(req, res, next, id) {
    co(function* () {
      const event = yield Event.findOne({ _id: id, user_id: req.me._id }).exec();
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
	 * Get user
	 * @returns {User}
	 */
	get(req, res) {
		return res.json(req.user);
	},

	/**
	 * Create new user
	 */
	createUser(req, res, next) {
		co(function* () {
			const newUser = new User(req.body);
			newUser.provider = 'local';
			newUser.status = 'activated';

			// newUser.validate(function(error) {
			// 	console.log(error);
			// });

			yield newUser.save();

			const salt = crypto.randomBytes(16).toString('base64');
			const unhashedToken = crypto.randomBytes(20).toString('base64');
			const hashedToken = crypto.pbkdf2Sync(unhashedToken, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
			const currentTime = moment(new Date()).add(3, 'years');
			const ua = new UaParser(req.get('user-agent'));

			const newRefreshToken = new RefreshToken({
				token: hashedToken,
				salt,
				os: ua.getOS(),
				device: ua.getDevice(),
				geo: geoip.lookup(req.ip),
				ip: req.ip,
				browser: ua.getBrowser(),
				user_id: newUser._id,
				expireAt: currentTime.toDate(),
				createdAt: new Date(),
				lastActiveTime: new Date()
			});
			yield newRefreshToken.save();

			const payload = newUser.toJSON();
			const iat = moment(new Date());
			const ext = moment(new Date()).add(1, 'days');
			payload.iat = iat.unix();
			payload.ext = ext.unix();
			const escaped = encodeURI(JSON.stringify(payload));
			const token = jwt.sign(escaped, config.secret);

			// if (req.body.invitation) {
			// }

			return res.json({ clientId: newRefreshToken._id, accessToken: token, refreshToken: unhashedToken });
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Local login
	 */
	localLogin(req, res, next) {
		co(function* () {
			const salt = crypto.randomBytes(16).toString('base64');
			const unhashedToken = crypto.randomBytes(20).toString('base64');
			const hashedToken = crypto.pbkdf2Sync(unhashedToken, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
			const currentTime = moment(new Date()).add(3, 'years');
			const ua = new UaParser(req.get('user-agent'));

			let requireNewRefreshToken = false;
			let clientId = req.body.clientId;
			if (clientId) {
				const currentRefreshToken = yield RefreshToken.findOne({ _id: clientId, user_id: req.user._id }).exec();
				if (currentRefreshToken) {
					currentRefreshToken.token = hashedToken;
					currentRefreshToken.salt = salt;
					currentRefreshToken.os = ua.getOS();
					currentRefreshToken.device = ua.getDevice();
					currentRefreshToken.geo = geoip.lookup(req.ip);
					currentRefreshToken.ip = req.ip;
					currentRefreshToken.browser = ua.getBrowser();
					currentRefreshToken.expireAt = currentTime.toDate();
					currentRefreshToken.createdAt = new Date();
					currentRefreshToken.lastActiveTime = new Date();
					yield currentRefreshToken.save();
				} else {
					requireNewRefreshToken = true;
				}
			} else {
				requireNewRefreshToken = true;
			}

			if (requireNewRefreshToken) {
				const newRefreshToken = new RefreshToken({
					token: hashedToken,
					salt,
					os: ua.getOS(),
					device: ua.getDevice(),
					geo: geoip.lookup(req.ip),
					ip: req.ip,
					browser: ua.getBrowser(),
					user_id: req.user._id,
					expireAt: currentTime.toDate(),
					createdAt: new Date(),
					lastActiveTime: new Date()
				});
				yield newRefreshToken.save();
				clientId = newRefreshToken._id;
			}

			const payload = req.user.toJSON();
			const iat = moment(new Date());
			const ext = moment(new Date()).add(1, 'days');
			payload.iat = iat.unix();
			payload.ext = ext.unix();
			const escaped = encodeURI(JSON.stringify(payload));
			const token = jwt.sign(escaped, config.secret);

			return res.json({ clientId, accessToken: token, refreshToken: unhashedToken });
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * User logout
	 */
	logout(req, res, next) {
		co(function* () {
			yield RefreshToken.remove({ _id: req.body.clientId, user_id: req.me._id }).exec();
			req.logout();
			res.status(204).end();
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Retrieve new access token
	 */
	refreshAccessToken(req, res, next) {
		co(function* () {
			const refreshToken = yield RefreshToken.findOne({ _id: req.body.clientId }).exec();
			if (!refreshToken) {
				return res.status(400).end();
			}
			const salt = refreshToken.salt;
			const unhashedToken = req.body.refreshToken;
			const hashedToken = crypto.pbkdf2Sync(unhashedToken, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
			if (hashedToken !== refreshToken.token) {
				return res.status(400).end();
			}

			const user = yield User.findOne({ _id: refreshToken.user_id }).exec();
			if (!user) {
				return res.status(400).end();
			}
			refreshToken.ip = req.ip;
			refreshToken.geo = geoip.lookup(req.ip);
			refreshToken.lastActiveTime = new Date();
			yield refreshToken.save();

			const payload = user.toJSON();
			const currentTime = moment.utc();
			payload.iat = currentTime.unix();
			payload.ext = currentTime.add(1, 'days').unix();
			let escaped = JSON.stringify(payload);
			escaped = encodeURI(escaped);
			const token = jwt.sign(escaped, config.secret);
			return res.json({ accessToken: token });
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Show me
	 */
	showMe(req, res, next) {
		co(function* () {
			const me = yield User.findOne({ _id: req.me._id }).exec();
			return res.json(me.toJSON());
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Update my icon
	 */
	updateMyIcon(req, res, next) {
		co(function* () {
			const me = new User(req.me);
			const body = req.body;
			const files = body.uploadedDocs;
			imageUploader(me, files[0], null, 'icon', res, (fsFile) => {
				User.update({ _id: me._id }, { $set: { icon: fsFile._id } }, (err) => {
					if (err) {
						console.log(err);
						return res.status(500).end();
					}
					return res.status(201).json({ icon: fsFile._id });
				});
			});
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Show user icon
	 */
	showUserIcon(req, res, next) {
		co(function* () {
			const fsFile = yield FsFile.findOne({ _id: req.user.icon, 'metadata.type': 'icon' }).lean().exec();
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
   * Show user events
   */
  showUserEvents(req, res, next) {
    co(function* () {
      let events = [];
      let query = null;
      if (req.user._id.toString() === req.me._id.toString()) {
        query = { user_id: req.me._id, group_id: null, friendship_id: null, startTime: { $lte: new Date(req.query.to) }, endTime: { $gte: new Date(req.query.from) } };
      } else {
        events = { user_id: req.user._id, group_id: null, friendship_id: null, startTime: { $lte: new Date(req.query.to) }, endTime: { $gte: new Date(req.query.from) }, isPublic: true };
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
   * Create user event
   */
  createUserEvent(req, res, next) {
    co(function* () {
      let newEvent = req.body;
      newEvent.user_id = req.me._id;
      newEvent.group_id = null;
      newEvent.friendship_id = null;
      newEvent.participants_id = [];
      newEvent.participantCounter = 0;
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
   * Update user event
   */
  updateUserEvent(req, res, next) {
    co(function* () {
      if (req.event.user_id.toString() !== req.me._id.toString()) {
        return res.status(403).end();
      }
      const updates = Object.keys(req.body);
			for (let i = 0; i < updates.length; i++) {
				req.event[updates[i]] = req.body[updates[i]];
			}
      yield req.event.save();
      return res.json(req.event);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Show my groups
   */
  showMyGroups(req, res, next) {
    co(function* () {
      const me = yield User.findOne({ _id: req.me._id }, 'groups_id').populate('groups_id', 'name icon isPublic').lean().exec();
      return res.json(me.groups_id);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * delete user event
   */
  deleteUserEvent(req, res, next) {
    co(function* () {
      if (req.event.user_id.toString() !== req.me._id.toString()) {
        return res.status(403).end();
      }
      yield Event.remove({ _id: req.event._id, user_id: req.me._id, group_id: null, friendship_id: null }).exec();
      return res.json({ _id: req.event._id });
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Show my group invitations
   */
  showMyGroupInvitations(req, res, next) {
    co(function* () {
      const me = yield User.findOne({ _id: req.me._id }, 'groupInvitations_id').populate('groupInvitations_id').lean().exec();
      return res.json(me.groupInvitations_id);
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Accept group invitation
   */
  acceptGroupInvitation(req, res, next) {
    co(function* () {
      const result = yield User.update({ _id: req.me._id, groupInvitations_id: objectId(req.params.invitation_groupId) }, { $pull: { groupInvitations_id: objectId(req.params.invitation_groupId) }, $addToSet: { groups_id: objectId(req.params.invitation_groupId) } }).exec();
      if (result.nModified === 1) {
        return res.json({ acceptedGroup: req.params.invitation_groupId });
      }
      return res.status(400).end();
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Reject group invitation
   */
  rejectGroupInvitation(req, res, next) {
    co(function* () {
      const result = yield User.update({ _id: req.me._id, groupInvitations_id: objectId(req.params.invitation_groupId) }, { $pull: { groupInvitations_id: objectId(req.params.invitation_groupId) } }).exec();
      if (result.nModified === 1) {
        return res.json({ rejectedGroup: req.params.invitation_groupId });
      }
      return res.status(400).end();
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Follow group
   */
  followGroup(req, res, next) {
    co(function* () {
      if (!req.group.isPublic) {
        return res.status(403).end();
      }
      if (req.groupPrivilege !== 'x') {
        return res.status(400).end();
      }
      const result = yield User.update({ _id: req.me._id, groups_id: { $ne: req.group._id }, follows_id: { $ne: req.group._id } }, { $addToSet: { follows_id: req.group._id } }).exec();
      if (result.nModified === 1) {
        return res.json({ followedGroup: req.group._id });
      }
      return res.status(400).end();
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Unfollow group
   */
  unfollowGroup(req, res, next) {
    co(function* () {
      if (!req.group.isPublic) {
        return res.status(403).end();
      }
      if (req.groupPrivilege !== 'f') {
        return res.status(400).end();
      }
      const result = yield User.update({ _id: req.me._id, groups_id: { $ne: req.group._id }, follows_id: req.group._id }, { $pull: { follows_id: req.group._id } }).exec();
      if (result.nModified === 1) {
        return res.json({ unfollowedGroup: req.group._id });
      }
      return res.status(400).end();
    }).catch((err) => {
      next(err);
    });
  },

  /**
   * Search users
   */
  searchUsers(req, res, next) {
    co(function* () {
      const users = yield User.find({ $or: [{ username: { $regex: req.query.query, $options: 'i' } }, { email: { $regex: req.query.query, $options: 'i' } }] }, 'username email icon').sort({ username: 1, email: 1 }).limit(10).lean().exec();
      return res.json(users);
    }).catch((err) => {
      next(err);
    });
  },

	/**
	 * Update existing user
	 * @property {string} req.body.username - The username of user.
	 * @property {string} req.body.mobileNumber - The mobileNumber of user.
	 * @returns {User}
	 */
	update(req, res, next) {
		const user = req.user;
		user.username = req.body.username;
		user.mobileNumber = req.body.mobileNumber;

		user.saveAsync()
			.then((savedUser) => res.json(savedUser))
			.error((e) => next(e));
	},

	/**
	 * Get user list.
	 * @property {number} req.query.skip - Number of users to be skipped.
	 * @property {number} req.query.limit - Limit number of users to be returned.
	 * @returns {User[]}
	 */
	list(req, res, next) {
		const { limit = 50, skip = 0 } = req.query;
		User.list({ limit, skip }).then((users) =>	res.json(users))
			.error((e) => next(e));
	},

	/**
	 * Delete user.
	 * @returns {User}
	 */
	remove(req, res, next) {
		const user = req.user;
		user.removeAsync()
			.then((deletedUser) => res.json(deletedUser))
			.error((e) => next(e));
	}

};
