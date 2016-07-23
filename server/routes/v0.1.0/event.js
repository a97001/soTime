const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const eventCtrl = require('../../controllers/v0.1.0/event');

const router = express.Router();	// eslint-disable-line new-cap

router.route('/')
/**
* @api {get} /events Search or show events
* @apiVersion 0.1.0
* @apiGroup Events
* @apiParam {Date} from Event date from
* @apiParam {Date} to Event date to
* @apiParam {String} [title] Part of title
* @apiParam {String} [type] Event type
* @apiParam {Number} [skip] Skip results
* @apiParamExample {json} Input
*    {
*      "from": Date,
*      "to": Date,
*      "title": "gay",
*      "type": "gay",
*      "skip": 10
*    }
* @apiSuccessExample {json} Success
*    [{
*      "title": "fishGay is gay",
*      "description": "fishGay is very gay",
*      "type": "gay",
*      "startTime": Date,
*      "allDay": false,
*      "endTime": Date,
*      "venue": {
*        "coordinates": {
*          "lat": Number,
*          "lon": Number
*        },
*        name: "Home"
*      },
*      "isPublic": true
*    }]
*/

	.get(validate(paramValidation.showEvents), eventCtrl.showEvents);


/** Load user when API with userId route parameter is hit */
router.param('eventId', eventCtrl.load);

module.exports = router;
