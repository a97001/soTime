const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * FsFile Schema
 */
const FsFileSchema = new Schema({
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

/**
 * @typedef FsFile
 */
module.exports = mongoose.model('FsFile', FsFileSchema, 'fs.files');
