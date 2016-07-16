// import Promise from 'bluebird';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const _ = require('lodash');
const crypto = require('crypto');

const Schema = mongoose.Schema;

/**
 * Validations
 */

// If you are authenticating by any of the oauth strategies, don't validate.
const validatePresenceOf = function (value) {
  // If you are authenticating by any of the oauth strategies, don't validate.
  return (this.provider && this.provider !== 'local') || (value && value.length);
};

const validateUniqueEmail = function (value, callback) {
  const User = mongoose.model('User');
  User.find({
    $and: [{
      email: { $regex: value, $options: 'i' }
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, (err, user) => {
    callback(err || user.length === 0);
  });
};

/**
 * Getter
 */
const escapeProperty = (value) => _.escape(value);

/**
 * User Schema
 */
const UserSchema = new Schema({
	name: {
    type: String,
    get: escapeProperty
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    validate: [validateUniqueEmail, 'E-mail address is already in-use']
  },
  username: {
    type: String,
    required: true,
    get: escapeProperty
  },
  roles: {
    type: Array,
    default: ['authenticated', 'anonymous']
  },
  hashed_password: {
    type: String,
    validate: [validatePresenceOf, 'Password cannot be blank']
  },
  provider: {
    type: String,
    default: 'local'
  },
  salt: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {},
  status: String,
  gender: String,
  birthday: Date,
  icon: {
    type: Schema.Types.ObjectId,
    ref: 'FsFile',
    default: null
  },
  settings: Object,
  groups_id: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  follows_id: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  groupType: {
    type: Schema.Types.Mixed
  },
  followType: {
    type: Schema.Types.Mixed
  }
});

/**
 * Virtuals
 */
 UserSchema.virtual('password').set(function (password) {
   this._password = password;
   this.salt = this.makeSalt();
   this.hashed_password = this.hashPassword(password);
 }).get(function () {
   return this._password;
 });

 /**
  * Pre-save hook
  */
 UserSchema.pre('save', function (next) {
   if (this.isNew && this.provider === 'local' && this.password && !this.password.length) {
     return next(new Error('Invalid password'));
   }
   return next();
 });

/**
 * Methods
 */
 UserSchema.methods = {

   /**
    * HasRole - check if the user has required role
    *
    * @param {String} plainText
    * @return {Boolean}
    * @api public
    */
   hasRole(role) {
     const roles = this.roles;
     return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
   },

   /**
    * IsAdmin - check if the user is an administrator
    *
    * @return {Boolean}
    * @api public
    */
   isAdmin() {
     return this.roles.indexOf('admin') !== -1;
   },

   /**
    * Authenticate - check if the passwords are the same
    *
    * @param {String} plainText
    * @return {Boolean}
    * @api public
    */
   authenticate(plainText) {
     return this.hashPassword(plainText) === this.hashed_password;
   },

   /**
    * Make salt
    *
    * @return {String}
    * @api public
    */
   makeSalt() {
     return crypto.randomBytes(16).toString('base64');
   },

   /**
    * Hash password
    *
    * @param {String} password
    * @return {String}
    * @api public
    */
   hashPassword(password) {
     if (!password || !this.salt) return '';
     const salt = new Buffer(this.salt, 'base64');
     return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
   },

   /**
    * Hide security sensitive fields
    *
    * @returns {*|Array|Binary|Object}
    */
   toJSON() {
     const obj = this.toObject();
     delete obj.hashed_password;
     delete obj.salt;
     return obj;
   }
 };

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
