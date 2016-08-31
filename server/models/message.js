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
    type: String,
    default: 'txt'
  },
  txt: {
    type: String
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'FsFile'
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
    type: Date,
    default: new Date()
  }
});

/**
 * @typedef Message
 */
module.exports = mongoose.model('Message', MessageSchema, 'messages');
