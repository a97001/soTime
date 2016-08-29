// import Promise from 'bluebird';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const Schema = mongoose.Schema;

/**
 * Vote Schema
 */
const VoteSchema = new Schema({
  event_id: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String
  },
  dateOptions: [{
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    voters_id: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0
    }
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
});

/**
 * @typedef Vote
 */
module.exports = mongoose.model('Vote', VoteSchema, 'votes');
