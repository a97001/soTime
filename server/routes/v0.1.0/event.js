const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const eventCtrl = require('../../controllers/v0.1.0/event');

const router = express.Router();	// eslint-disable-line new-cap

// router.route('/')


/** Load user when API with userId route parameter is hit */
router.param('eventId', eventCtrl.load);

module.exports = router;
