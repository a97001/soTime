// import Promise from 'bluebird';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const Schema = mongoose.Schema;

/**
 * Group Schema
 */
const GroupSchema = new Schema({
  host_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
	},
	members_id: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
  memberCounter: {
    type: Number
  },
	followers_id: [{
		// user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
		// },
		// types: []
	}],
  followerCounter: {
    type: Number
  },
	invitations_id: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
  invitationCounter: {
    type: Number
  },
	name: {
		type: String
	},
	icon: {
		type: Schema.Types.ObjectId
	},
  hasIcon: {
    type: Boolean
  },
	isPublic: Boolean,
	authentication: {
		isAuthenticated: Boolean,
		identity: {
			type: Schema.Types.ObjectId
		}
	}
	// mute: {
	// 	start: Date,
	// 	duration: Number
	// }
});

/**
 * @typedef Group
 */
module.exports = mongoose.model('Group', GroupSchema, 'groups');
