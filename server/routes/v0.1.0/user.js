const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const userCtrl = require('../../controllers/v0.1.0/user');

const router = express.Router();	// eslint-disable-line new-cap

router.route('/')
	/** GET /api/users - Get list of users */

	.get(userCtrl.list)

	/**
 * @api {post} /users Create a user
 * @apiVersion 0.1.0
 * @apiGroup Users
 * @apiParam {String} email Login email address
 * @apiParam {String} username Displayed username
 * @apiParam {String} password Login password
 * @apiParamExample {json} Input
 *    {
 *      "email": "fishgay@gmail.com",
 *      "username": "fishGay",
 *      "password": "*******"
 *    }
 * @apiSuccessExample {json} Success
 *    {
 *      "clientId": "ObjectId",
 *      "accessToken": "xlsdjfwelfkjklsjdklfjlwaef.nfleflwejflkjlwejflwe.wjefwjlefowef",
 *      "refreshToken": "ksdflwjelfklewf+=="
 *    }
 */
	.post(validate(paramValidation.createUser), userCtrl.createUser);

router.route('/login')
/**
* @api {post} /users/login Local login
* @apiVersion 0.1.0
* @apiGroup Users
* @apiParam {String} email Login email
* @apiParam {String} password Login password
* @apiParamExample {json} Input
*    {
*      "email": "gayhong@gmail.com",
*      "password": "********"
*    }
* @apiSuccessExample {json} Success
*    HTTP/1.1 204 No Content
* @apiErrorExample {json} Login error
*    HTTP/1.1 401 Unauthorized
*/
	.post(passport.authenticate('local', { session: false }), userCtrl.localLogin);

router.route('/logout')
/**
* @api {post} /users/logout User logout
* @apiVersion 0.1.0
* @apiGroup Users
* @apiParam {String} clientId Client ID
* @apiParamExample {json} Input
*    {
*      "clientId": "5776b46d42daac9c6c222141",
*    }
* @apiSuccessExample {json} Success
*    HTTP/1.1 204 No Content
*/
	.post(validate(paramValidation.logoutUser), userCtrl.logout);


router.route('/token')
/**
* @api {post} /users/token Refresh access token
* @apiVersion 0.1.0
* @apiGroup Users
* @apiParam {String} clientId Client ID
* @apiParam {String} refreshToken Refresh Token
* @apiParamExample {json} Input
*    {
*      "clientId": "5776b46d42daac9c6c222141",
*      "refreshToken": "ksdflwjelfklewf+=="
*    }
* @apiSuccessExample {json} Success
*    {
*      "accessToken": "xlsdjfwelfkjklsjdklfjlwaef.nfleflwejflkjlwejflwe.wjefwjlefowef",
*    }
* @apiErrorExample {json} Refresh access token error
*    HTTP/1.1 400 Bad Request
*/
	.post(validate(paramValidation.refreshAccessToken), userCtrl.refreshAccessToken);

router.route('/me')
/**
* @api {get} /users/me Show me
* @apiVersion 0.1.0
* @apiGroup Users
* @apiSuccessExample {json} Success
*    {
*      "name": "fishGay",
*      "email": "fishgay@gmail.com",
*      "username": "fishGay",
*      "birthday": date,
*      "gender": "f",
*      "icon": ObjectId,
*      ...
*
*    }
*/
	.get(userCtrl.showMe);

router.route('/me/icons')
/**
* @api {put} /users/me/icons Update user icon
* @apiVersion 0.1.0
* @apiGroup Users
* @apiParam {String[]} uploadedDocs Uploaded Icon
* @apiParamExample {json} Input
*    {
*      "uploadedDocs": Array
*    }
* @apiSuccessExample {json} Success
*    {
*      "icon": ObjectId
*    }
*/
	.put(userCtrl.updateMyIcon);

router.route('/:userId')
	/** GET /api/users/:userId - Get user */
	.get(userCtrl.get)

	/** PUT /api/users/:userId - Update user */
	// .put(validate(paramValidation.updateUser), userCtrl.update)

	/** DELETE /api/users/:userId - Delete user */
	.delete(userCtrl.remove);

router.route('/:userId/icons/:iconId')
/**
* @api {get} /users/:userId/icons/:iconId Show user icon
* @apiVersion 0.1.0
* @apiGroup Users
* @apiSuccessExample {json} Success
*			image file
*/
	.get(userCtrl.showUserIcon);

router.route('/me/events')
/**
* @api {post} /users/me/events Create user event
* @apiVersion 0.1.0
* @apiGroup Events
* @apiParam {String} title Event Title
* @apiParam {String} description Event Description
* @apiParam {Date} startTime Event Start Time
* @apiParam {Boolean} allDay Is All Day Event
* @apiParam {Date} endTime Event End Time
* @apiParam {Object} venue Event Venue
* @apiParam {Object} venue.coordinates Event Venue coordinates
* @apiParam {Number} venue.coordinates.lat Event Venue Latitude
* @apiParam {Number} venue.coordinates.lon Event Venue Longitude
* @apiParam {Number} venue.name Event Venue Name
* @apiParam {Boolean} isPublic Is Event Public
* @apiParamExample {json} Input
*    {
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
	.post(validate(paramValidation.createUserEvent), userCtrl.createUserEvent);

router.route('/me/events/:user_eventId')
/**
* @api {put} /users/me/events/:eventId Update user event
* @apiVersion 0.1.0
* @apiGroup Events
* @apiParam {String} title Event Title
* @apiParam {String} description Event Description
* @apiParam {Date} startTime Event Start Time
* @apiParam {Boolean} allDay Is All Day Event
* @apiParam {Date} endTime Event End Time
* @apiParam {Object} venue Event Venue
* @apiParam {Object} venue.coordinates Event Venue coordinates
* @apiParam {Number} venue.coordinates.lat Event Venue Latitude
* @apiParam {Number} venue.coordinates.lon Event Venue Longitude
* @apiParam {Number} venue.name Event Venue Name
* @apiParam {Boolean} isPublic Is Event Public
* @apiParamExample {json} Input
*    {
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
	.put(validate(paramValidation.updateUserEvent), userCtrl.updateUserEvent)

/**
* @api {delete} /users/me/events/:eventId Delete user event
* @apiVersion 0.1.0
* @apiGroup Events
* @apiSuccessExample {json} Success
*    {
*      "_id": ObjectId
*    }
*/
	.delete(userCtrl.deleteUserEvent);

router.route('/:userId/events')
/**
* @api {get} /users/:userId/events Show user events
* @apiVersion 0.1.0
* @apiGroup Events
* @apiParam {Date} from Date From
* @apiParam {Date} to Date To
* @apiParam {String} [type] Event Type
* @apiParamExample {json} Input
*    {
*      "from": Date,
*      "to": Date,
*      "type": "gay",
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
	.get(validate(paramValidation.showUserEvents), userCtrl.showUserEvents);

router.route('/me/groups')
/**
* @api {get} /users/me/groups Show user groups
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    [{
*      "_id": ObjectId,
*      "name": "fishGay is gay",
*      "icon": ObjectId,
*      "isPublic": false
*    }]
*/
	.get(userCtrl.showMyGroups);

router.route('/me/group-invitations')
/**
* @api {get} /users/me/group-invitations Show my group invitations
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    [{
*      "_id": ObjectId,
*      "name": "fishGay is gay"
*    }]
*/
	.get(userCtrl.showMyGroupInvitations);

router.route('/me/group-invitations/:invitation_groupId')
/**
* @api {post} /users/me/group-invitations/:groupId Accept group invitation
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    {
*      "acceptedGroup": ObjectId,
*    }
*/
	.post(userCtrl.acceptGroupInvitation)

/**
* @api {delete} /users/me/group-invitations/:groupId Reject group invitation
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    {
*      "rejectedGroup": ObjectId,
*    }
*/
	.delete(userCtrl.rejectGroupInvitation);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);
router.param('user_eventId', userCtrl.loadUserEvent);

module.exports = router;
