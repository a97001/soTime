const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const uploadCtrl = require('../../controllers/v0.1.0/upload');

const router = express.Router();	// eslint-disable-line new-cap

// router.route('/')
router.route('/document')
/**
* @api {get} /uploads/document Get upload document
* @apiVersion 0.1.0
* @apiGroup Uploads
*/
  .get(uploadCtrl.getUploadDocument)

/**
* @api {post} /uploads/document Post upload document
* @apiVersion 0.1.0
* @apiGroup Uploads
*/
  .post(uploadCtrl.postUploadDocument);

router.route('/document/thumbnail/:upload_document_name')
/**
* @api {get} /uploads/document/thumbnail/:upload_document_name Get document thumbnail
* @apiVersion 0.1.0
* @apiGroup Uploads
*/
  .get(uploadCtrl.getDocThumbnail);

router.route('/document/:upload_document_name')
/**
* @api {get} /uploads/document/:upload_document_name Get document
* @apiVersion 0.1.0
* @apiGroup Uploads
*/
  .get(uploadCtrl.getDoc)

/**
* @api {delete} /uploads/document/:upload_document_name delete upload document
* @apiVersion 0.1.0
* @apiGroup Uploads
*/
  .delete(uploadCtrl.deleteUploadDocument);

router.param('upload_document_name', uploadCtrl.filename);

module.exports = router;
