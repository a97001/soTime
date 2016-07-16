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
	 * User logout
	 */
	logout(req, res, next) {
		co(function* () {
			yield RefreshToken.remove({ _id: req.body.clientId, userId: req.me._id }).exec();
			req.logout();
			res.status(204).end();
		}).catch((err) => {
			next(err);
		});
	}

};
