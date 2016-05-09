'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('meanio').loadConfig();

var FsFileSchema = new Schema({
    filename: {
        type: String,
        required: 'File name is required'
    },
    length: {
        type: Number
    },
    contentType: {
        type: String
    },
    uploadDate: {
        type: Date
    },
    metadata: {
        type: {
            type: String
        },
        attribute: {
            type: Object
        },
        uploader: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        desc: {
          type: String
        }
    }
});

mongoose.model('FsFile', FsFileSchema, 'fs.files');
