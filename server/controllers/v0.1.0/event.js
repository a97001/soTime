const co = require('co');
const moment = require('moment');
const imageUploader = require('../../helpers/ImageUploader');
// const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const config = require('../../../config/env');

const User = require('../../models/user');
const FsFile = require('../../models/fsfile');
const Event = require('../../models/event');
const RefreshToken = require('../../models/refreshToken');

// Grid.mongo = mongoose.mongo;
// let gfs = null;
// mongoose.connection.once('open', () => {
//   gfs = new Grid(mongoose.connection.db);
// });

module.exports = {
	/**
	 * Load event and append to req.
	 */
	load(req, res, next, id) {
		co(function* () {
			const event = yield Event.findById(id).exec();
			req.event = event;
			return next();
		}).catch((err) => {
			next(err);
		});
	},

	/**
	 * Get event
	 */
	showEvent(req, res) {
		return res.json(req.event);
	},

	/**
	 * Show events
	 */
	showEvents(req, res, next) {
		co(function* () {
			const skip = req.query.skip ? req.query.skip : 0;
			const me = yield User.findOne({ _id: req.me._id }).lean().exec();
			const query = { startTime: { $lte: req.query.to, $gte: req.query.from }, $or: [
				{ user_id: req.me._id },
				{ group_id: { $in: me.groups_id } },
				{ group_id: { $in: me.groups_id }, isPublic: true },
				{ isPublic: true }
			] };

			if (req.query.title) {
				query.title = { $regex: req.query.title, $options: 'i' };
			}
			if (req.query.type) {
				query.type = req.query.type;
			}
			const	events = yield Event.find(query).sort({ from: -1 }).skip(skip).limit(10).lean().exec();
			return res.json(events);
		}).catch((err) => {
			next(err);
		});
	}

};
