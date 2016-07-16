const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../../config/param-validation');
const passport = require('passport');
const groupCtrl = require('../../controllers/v0.1.0/group');

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
* @api {put} /groups Update group
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
	.put(validate(paramValidation.updateGroup), groupCtrl.updateGroup);

router.param('groupId', groupCtrl.load);

module.exports = router;