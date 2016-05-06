'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    // mongoosastic = require('mongoosastic'),
    Schema = mongoose.Schema;
    // config = require('meanio').loadConfig(),
    // crypto = require('crypto');

var PhotosSchema = new Schema({
    filename: {
        type: String,
        es_indexed: true
    },
    photoUrl: [Buffer],
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        es_indexed: true
    },
    uploadDate: {
        type: Date,
        es_indexed: true
    },
    length: {
        type: Number
    }
});

mongoose.model('Photo', PhotosSchema, 'photos');
