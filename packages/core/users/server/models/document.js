'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('meanio').loadConfig();
    // config = require('meanio').loadConfig(),
    // crypto = require('crypto');

var DocumentsSchema = new Schema({
    type: {
        type: String
    },
    current: {
        _id: Schema.Types.ObjectId,
        filename: {
          type: String,
          es_indexed: true
        },
        uploader: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          es_indexed: true
        },
        uploadDate: Date,
        contentType: String,
        length: Number,
        chunkSize: Number,
        md5: String,
        aliases: String
    },
    docs: {
        type: Array
    },
    metadata: {
        desc: {
            type: String,
            es_indexed: true
        },
        uploader: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            es_indexed: true
        },
        tags: {
            system: {
                type: String,
                es_indexed: true
            },
            subSystem: {
                type: String,
                es_indexed: true
            },
            cTags: {
                type: [String],
                es_indexed: true
            }
        }

    },
    status: {
        type: String
    }
});

mongoose.model('Document', DocumentsSchema, 'documents');
