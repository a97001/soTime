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
	showAllGroups(req, res, next) {
		co(function* () {
			const groups = yield Group.find({}).exec();
			return res.json(groups);
		}).catch((err) => {
			next(err);
		});
	}

};
