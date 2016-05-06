'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

var RefreshTokenSchema = new Schema({
    // _id as clientId
    token: {
        type: String
    },
    salt: {
        type: String
    },
    os: {
        type: String
    },
    lastActiveTime: {
        type: Date
    },
    deviceName: {
        type: String
    },
    location: {
        type: String
    },
    ip: {
        type: String
    },
    browser: {
        type: String
    },
    userId: {
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

RefreshTokenSchema.pre('save', function(next){
    var now = new Date();
    this.lastActiveTime = now;
    if ( !this.createdAt ) {
        this.createdAt = now;
    }
    next();
});

mongoose.model('RefreshToken', RefreshTokenSchema, 'refreshTokens');