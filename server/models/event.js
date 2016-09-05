// import Promise from 'bluebird';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const Schema = mongoose.Schema;

/**
 * Event Schema
 */
const EventSchema = new Schema({
  title: String,
	description: String,
	type: String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
	group_id: {
		type: Schema.Types.ObjectId,
    ref: 'Group'
	},
  friendship_id: {
    type: Schema.Types.ObjectId,
    ref: 'Friendship'
  },
	participants_id: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
  participantCounter: {
    type: Number
  },
	goings_id: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
  goingCounter: {
    type: Number
  },
	notGoings_id: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
  notGoingCounter: {
    type: Number
  },
	startTime: {
		type: Date
	},
	allDay: Boolean,
	endTime: Date,
	voteStart: Date,
	voteEnd: Date,
	venue: {
		coordinates: {
			lat: Number,
			lon: Number
		},
		name: String
	},
	isPublic: Boolean,
	banner: {
    type: Schema.Types.ObjectId,
    ref: 'FsFile'
  },
	photos_id: [{
    type: Schema.Types.ObjectId,
    ref: 'FsFile'
  }]
});

/**
 * @typedef Event
 */
module.exports = mongoose.model('Event', EventSchema, 'events');
