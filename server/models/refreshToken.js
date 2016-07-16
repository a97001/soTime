// import Promise from 'bluebird';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * RefreshToken Schema
 */
const RefreshTokenSchema = new Schema({
  // _id as clientId
  token: {
      type: String
  },
  salt: {
      type: String
  },
  os: {
      type: Schema.Types.Mixed,
      default: null
  },
  lastActiveTime: {
      type: Date
  },
  device: {
      type: Schema.Types.Mixed,
      default: null
  },
  geo: {
      type: Object
  },
  ip: {
      type: String
  },
  browser: {
      type: Schema.Types.Mixed,
      default: null
  },
  user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  expireAt: {
      type: Date,
      // default: new Date()
  },
  createdAt: {
      type: Date,
      // default: new Date()
  }
});

/**
 * @typedef Group
 */
module.exports = mongoose.model('RefreshToken', RefreshTokenSchema, 'refreshTokens');
