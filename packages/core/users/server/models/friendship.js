'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('meanio').loadConfig();

var FriendshipsSchema = new Schema({
    status: {
      type: String
    },
    users: [{
      type: Schema.Types.ObjectId,
  		ref: 'User'
    }],
    date: {
      type: Date
    }

});
mongoose.model('Friendship', FriendshipsSchema, 'friendships');
