'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('meanio').loadConfig();

var GroupsSchema = new Schema({
    host: {
  		type: Schema.Types.ObjectId,
  		ref: 'User'
  	},
  	members: [{
  		type: Schema.Types.ObjectId,
  		ref: 'User'
  	}],
  	followings: [{
  		user: {
  			type: Schema.Types.ObjectId,
  			ref: 'User'
  		},
  		types: []
  	}],
  	invited: [{
  		type: Schema.Types.ObjectId,
  		ref: 'User'
  	}],
  	name: {
  		type: String
  	},
  	icon: {
  		type: Schema.Types.ObjectId
  	},
  	isPublic: Boolean,
  	authentication: {
  		isAuthenticated: Boolean,
  		identity: {
  			type: Schema.Types.ObjectId
  		}
  	},
  	mute: {
  		start: Date,
  		duration: Number
  	}
});
mongoose.model('Group', GroupsSchema, 'groups');
