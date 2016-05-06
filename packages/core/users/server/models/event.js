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
	group: {
		type: Schema.Types.ObjectId
	},
	user: {
		type: Schema.Types.ObjectId,
    ref: 'User'
	},
	participants: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
	goings: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
	notGoings: [{
		type: Schema.Types.ObjectId,
    ref: 'User'
	}],
	votes: [{
		type: String,
		option: {
			type: Date
		},
		voters: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	}],
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
	banner: Schema.Types.ObjectId,
	photos:[Schema.Types.ObjectId]
});
mongoose.model('Event', EventsSchema, 'events');
