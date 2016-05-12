'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('meanio').loadConfig();

var EventsSchema = new Schema({
  host: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	name: String,
	description: String,
	type: String,
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
	group: {
		type: Schema.Types.ObjectId,
    ref: 'Group'
	},
  friendship: {
    type: Schema.Types.ObjectId,
    ref: 'Friendship'
  },
	participants: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
  participantCounter: {
    type: Number
  },
	goings: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
  goingCounter: {
    type: Number
  },
	notGoings: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
  notGoingCounter: {
    type: Number
  },
	votes: [{
		type: String,
		option: {
			type: Date
		},
		voters: [{
			type: Schema.Types.ObjectId,
			ref: 'User'
		}],
    voteCounter: {
      type: Number
    }
	}],
  totalVoteCounter: {
    type: Number
  },
	eventStart: {
		type: Date
	},
	isAllDay: Boolean,
	eventDuration: Number,
	voteStart: Date,
	voteDuration: Number,
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
  hasBanner: {
    type: Boolean
  },
	photos:[{
    type: Schema.Types.ObjectId,
    ref: 'FsFile'
  }]
});
mongoose.model('Event', EventsSchema, 'events');
