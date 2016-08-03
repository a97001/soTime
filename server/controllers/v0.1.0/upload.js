const co = require('co');
const moment = require('moment');
const blueimpUploader = require('blueimp-file-upload-expressjs');
const config = require('../../../config/env');

const User = require('../../models/user');
const RefreshToken = require('../../models/refreshToken');

const uploaderOptions = {
  tmpDir: '',
  uploadDir: '',
  uploadUrl: '/v1/upload/document/',
  useSSL: true,
  copyImgAsThumb: false,
  imageVersions: {
    width: 100,
    height: 'auto'
  },
  storage: {
    type: 'local'
  }
};

module.exports = {
  /**
  * Filename param
  */
  filename(req, res, next, filename) {
    req.filename = filename;
    next();
  },

 /**
 * get document
 */
  getDoc(req, res) {
    const options = {
      root: `/uploaded/files/${req.me.email}/`,
      dotfiles: 'deny'
    };
    res.sendFile(req.filename, options, (err) => {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
    });
  },

  /**
   * get document thumbnail
   */
  getDocThumbnail(req, res) {
    const options = {
      root: `/uploaded/files/${req.me.email}/thumbnail/`,
      dotfiles: 'deny'
    };
    res.sendFile(req.filename, options, (err) => {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
    });
  },

/**
 * get upload document
 */
  getUploadDocument(req, res) {
    uploaderOptions.tmpDir = `/uploaded/tmp/${req.me.email}`;
    uploaderOptions.uploadDir = `/uploaded/files/${req.me.email}`;
    const uploader = blueimpUploader(uploaderOptions);
    uploader.get(req, res, (obj) => {
      res.send(JSON.stringify(obj));
    });
  },

  /**
   * post upload document
   */
  postUploadDocument(req, res) {
    uploaderOptions.tmpDir = `/uploaded/tmp/${req.me.email}`;
    uploaderOptions.uploadDir = `/uploaded/files/${req.me.email}`;
    const uploader = blueimpUploader(uploaderOptions);
    uploader.post(req, res, (obj) => {
      res.send(JSON.stringify(obj));
    });
  },

  /**
   * delete upload document
   */
  deleteUploadDocument(req, res) {
    uploaderOptions.tmpDir = `/uploaded/tmp/${req.me.email}`;
    uploaderOptions.uploadDir = `/uploaded/files/${req.me.email}`;
    const uploader = blueimpUploader(uploaderOptions);
    uploader.delete(req, res, (obj) => {
      res.send(JSON.stringify(obj));
    });
  }
};
