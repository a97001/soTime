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
    memberCounter: {
      type: Number
    },
  	followers: [{
  		// user: {
  			type: Schema.Types.ObjectId,
  			ref: 'User'
  		// },
  		// types: []
  	}],
    followerCounter: {
      type: Number
    },
  	invitations: [{
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
mongoose.model('Group', GroupsSchema, 'groups');
