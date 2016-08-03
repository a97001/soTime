const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const groupCtrl = require('../../controllers/v0.1.0/group');
const routeChecker = require('../../helpers/RouteChecker');


const router = express.Router();	// eslint-disable-line new-cap

router.route('/')
/**
* @api {get} /groups Search groups
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiParam {String} query Part of name
* @apiParamExample {json} Input
*    {
*      "query": "gay"
*    }
* @apiSuccessExample {json} Success
*    {
*      "_id": ObjectId,
*      "name": "fishGay",
*      "icon": ObjectId
*    }
*/

	.get(groupCtrl.searchGroups)

/**
* @api {post} /groups Create group
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiParam {String} name Group Name
* @apiParam {Boolean} isPublic Is Group Public
* @apiParamExample {json} Input
*    {
*      "name": "Fish Gay is Gay",
*      "isPublic": false,
*    }
* @apiSuccessExample {json} Success
*    [{
*      "name": "Fish Gay is Gay",
*      "host_id": ObjectId,
*      "memberCounter": 1,
*      "followerCounter": 0,
*      "invitations_id": [],
*      "invitationCounter": 0,
*      "icon": null,
*      "authentication": {
*        "isAuthenticated": false,
*        "identity": null
*      },
*      "isPublic": false
*    }]
*/
	.post(validate(paramValidation.createGroup), groupCtrl.createGroup);

router.route('/:groupId')
/**
* @api {get} /groups/:groupId Show group
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    {
*      "_id": ObjectId,
*      "name": "fishGay",
*      ...
*    }
*/
	.get(routeChecker.checkGroupPrivilege, groupCtrl.showGroup)

/**
* @api {put} /groups/:groupId Update group
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiParam {String} name Group Name
* @apiParam {Boolean} isPublic Is Group Public
* @apiParamExample {json} Input
*    {
*      "name": "Fish Gay is very Gay",
*      "isPublic": false,
*    }
* @apiSuccessExample {json} Success
*    [{
*      "name": "Fish Gay is very Gay",
*      "host_id": ObjectId,
*      "memberCounter": 1,
*      "followerCounter": 0,
*      "invitations_id": [],
*      "invitationCounter": 0,
*      "icon": null,
*      "authentication": {
*        "isAuthenticated": false,
*        "identity": null
*      },
*      "isPublic": false
*    }]
*/
	.put(validate(paramValidation.updateGroup), groupCtrl.updateGroup)

/**
* @api {delete} /groups/:groupId Delete group
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    {
*      "_id": ObjectId
*    }
*/
	.delete(groupCtrl.deleteGroup);

router.route('/:groupId/icons')
/**
* @api {put} /groups/:groupId/icons Update group icon
* @apiVersion 0.1.0
* @apiGroup Groups
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
	.put(routeChecker.checkGroupPrivilege, groupCtrl.updateGroupIcon);

router.route('/:groupId/icons/:iconId')
/**
* @api {get} /groups/:groupId/icons/:iconId Show group icon
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*			image file
*/
	.get(groupCtrl.showGroupIcon);

router.route('/:groupId/invitations')
/**
* @api {get} /groups/:groupId/invitations Show invited users
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    [{
*      "_id": ObjectId,
*      "username": "fishGay",
*    }]
*/
	.get(routeChecker.checkGroupPrivilege, groupCtrl.showInvitedUsers)

/**
* @api {post} /groups/:groupId/invitations Invite group member
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiParam {ObjectId} user Invited User
* @apiParamExample {json} Input
*    {
*      "user": ObjectId
*    }
* @apiSuccessExample {json} Success
*    {
*      "invitedUser": ObjectId
*    }
*/
	.post(validate(paramValidation.inviteGroupMember), routeChecker.checkGroupPrivilege, groupCtrl.inviteGroupMember);

router.route('/:groupId/invitations/:invitation_userId')
/**
* @api {delete} /groups/:groupId/invitations/:userId Disinvite group member
* @apiVersion 0.1.0
* @apiGroup Groups
* @apiSuccessExample {json} Success
*    {
*      "disinvitedUser": ObjectId
*    }
*/
	.delete(routeChecker.checkGroupPrivilege, groupCtrl.disinviteGroupMember);

router.route('/:groupId/events')
/**
* @api {get} /groups/:groupId/events Show group events
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
	.get(validate(paramValidation.showGroupEvents), routeChecker.checkGroupPrivilege, groupCtrl.showGroupEvents)

/**
* @api {post} /groups/:groupId/events Create group event
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
	.post(validate(paramValidation.createGroupEvent), routeChecker.checkGroupPrivilege, groupCtrl.createGroupEvent);

router.route('/:groupId/events/:group_eventId')
/**
* @api {put} /groups/:groupId/events/:eventId Update group event
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
	.put(validate(paramValidation.updateGroupEvent), routeChecker.checkGroupPrivilege, groupCtrl.updateGroupEvent)

/**
* @api {delete} /groups/:groupId/events/:eventId Delete group event
* @apiVersion 0.1.0
* @apiGroup Events
* @apiSuccessExample {json} Success
*    {
*      "_id": ObjectId
*    }
*/
	.delete(routeChecker.checkGroupPrivilege, groupCtrl.deleteGroupEvent);

router.route('/:groupId/events/:group_eventId/banners')
/**
* @api {put} /:groupId/events/:group_eventId/banners Update group event banner
* @apiVersion 0.1.0
* @apiGroup Events
* @apiParam {String[]} uploadedDocs Uploaded Icon
* @apiParamExample {json} Input
*    {
*      "uploadedDocs": Array
*    }
* @apiSuccessExample {json} Success
*    {
*      "banner": ObjectId
*    }
*/
	.put(routeChecker.checkGroupPrivilege, groupCtrl.updateGroupEventBanner);

router.route('/:groupId/events/:group_eventId/banners/:bannerId')
/**
* @api {get} /:groupId/events/:group_eventId/banners/:bannerId Show group event banner
* @apiVersion 0.1.0
* @apiGroup Events
* @apiSuccessExample {json} Success
*			image file
*/
	.get(groupCtrl.showGroupEventBanner);

router.param('groupId', groupCtrl.load);
router.param('group_eventId', groupCtrl.loadGroupEvent);

module.exports = router;
