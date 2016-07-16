const co = require('co');
const moment = require('moment');
const imageUploader = require('../../helpers/ImageUploader');
// const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const config = require('../../../config/env');

const User = require('../../models/user');
const FsFile = require('../../models/fsfile');
const Event = require('../../models/event');
const Group = require('../../models/group');

// Grid.mongo = mongoose.mongo;
// let gfs = null;
// mongoose.connection.once('open', () => {
//   gfs = new Grid(mongoose.connection.db);
// });

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
	 * Get group
	 */
	showGroup(req, res) {
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
			for (let i=0; i<updates.length; i++) {
				req.group[updates[i]] = req.body[updates[i]];
			}
			yield req.group.save();
			return res.json(req.group);
		}).catch((err) => {
			next(err);
		});
	}

};
