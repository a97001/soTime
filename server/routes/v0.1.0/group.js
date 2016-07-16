const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const groupCtrl = require('../../controllers/v0.1.0/group');

const router = express.Router();	// eslint-disable-line new-cap

// router.route('/')


router.param('groupId', groupCtrl.load);

module.exports = router;
