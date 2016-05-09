'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('meanio').loadConfig();

var NotificationsSchema = new Schema({
    type: {
      type: String
    },
    fromUser: {
  		type: Schema.Types.ObjectId,
  		ref: 'User'
  	},
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
  	isSystemMsg: {
  		type: Boolean
  	},
    isDelivered: {
      type: Boolean
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    content: {
      type: Schema.Types.Mixed
    }
});
mongoose.model('Notification', NotificationsSchema, 'notifications');
