const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const groupCtrl = require('../../controllers/v0.1.0/group');
const routeChecker = require('../../helpers/RouteChecker');


const router = express.Router();	// eslint-disable-line new-cap

router.route('/')
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

router.param('groupId', groupCtrl.load);

module.exports = router;
