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
        required: 'File name is required',
        es_indexed: true
    },
    length: {
        type: Number
    },
    contentType: {
        type: String,
        es_indexed: true
    },
    uploadDate: {
        type: Date,
        es_indexed: true
    },
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        es_indexed: true
    }
    // metadata: {
    //     tags: {
    //         system: {
    //             type: String,
    //             es_indexed: true
    //         },
    //         subSystem: {
    //             type: String,
    //             es_indexed: true
    //         },
    //         cTags: {
    //             type: [String],
    //             es_indexed: true
    //         },
    //         eTags: [{
    //             type: Schema.Types.ObjectId,
    //             ref: 'Equipment',
    //             es_indexed: true
    //         }]
    //     },
    //     status: {
    //         type: String,
    //         es_indexed: true
    //     },
    //     desc: {
    //         type: String,
    //         es_indexed: true
    //     },
    //     attribute: {
    //         type: [],
    //         es_indexed: true
    //     },
    //     company: [{
    //         type: Schema.Types.ObjectId,
    //         ref: 'Company'
    //     }],
    //     uploader: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'User',
    //         es_indexed: true
    //     },
    //     site: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Site',
    //         es_indexed: true
    //     },
    //     building: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Building',
    //         es_indexed: true
    //     },
    //     floor: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Floor',
    //         es_indexed: true
    //     },
    //     feature: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Feature',
    //         es_indexed: true
    //     }
    // }
});

mongoose.model('FsFile', FsFileSchema, 'fs.files');
