// import Promise from 'bluebird';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const Schema = mongoose.Schema;

/**
 * Message Schema
 */
const MessageSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
	},
	receivers_id: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
  group_id: {
    type: Schema.Types.ObjectId,
		ref: 'Group'
  },
  type: {
    type: String
  },
  text: {
    type: String
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'FsFile',
    default: null
  }],
  seenReceivers_id: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
  receivedReceivers_id: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  sendAt: {
    type: Date
  }
});

/**
 * @typedef Message
 */
module.exports = mongoose.model('Message', MessageSchema, 'messages');
