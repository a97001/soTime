const jwt = require('jsonwebtoken');
const co = require('co');
const Joi = require('joi');
const joiObjectid = require('joi-objectid');
const mongoose = require('mongoose');

const User = require('../../models/user');
const Group = require('../../models/group');
const Message = require('../../models/message');

const objectId = mongoose.Types.ObjectId;
Joi.objectId = joiObjectid(Joi);

const message = (io, socket, query, me) => {
	/**
	* @api {on} message:receiveMsg Receive message
	* @apiVersion 0.1.0
	* @apiGroup Chats
	* @apiSuccessExample {json} Success
	*    {
	*      group_id: '57c6d20a45886b802bb035ad',
	*      txt: 'test',
	*      sender_id: { _id: '57c6d20a45886b802bb035a2', username: 'fishGay1' },
	*      _id: '57c6d20b45886b802bb035b6',
	*      sendAt: '2016-08-31T12:48:09.903Z',
	*      attachments: [],
	*      type: 'txt'
	*    }
	*/

	/**
	* @api {emit} message:sendMsg Send message
	* @apiVersion 0.1.0
	* @apiGroup Chats
	* @apiParam {ObjectId} group_id Group ID
	* @apiParam {String{1..2000}} txt Message content
	* @apiSuccessExample {json} Success
	*    {
	*      group_id: '57c6d20a45886b802bb035ad',
	*      txt: 'test',
	*      sender_id: { _id: '57c6d20a45886b802bb035a2', username: 'fishGay1' },
	*      _id: '57c6d20b45886b802bb035b6',
	*      sendAt: '2016-08-31T12:48:09.903Z',
	*      attachments: [],
	*      type: 'txt'
	*    }
	*/

	socket.on('message:sendMsg', (msg, ack) => {
		co(function* () {
			const validation = Joi.validate(msg, {
				group_id: Joi.objectId(),
				txt: Joi.string().trim().min(1).max(2000)
			}, { stripUnknown: true, presence: 'required' });
			if (validation.error) {
				return 0;
			}
			msg = validation.value;
			const result = yield User.aggregate([
				{ $match: { groups_id: objectId(msg.group_id) } },
				{ $group: { _id: null, users: { $addToSet: '$_id' } } }
			]).exec();
			if (!result || !result[0] || !result[0].users) {
				return 0;
			}
			const groupUsers = JSON.parse(JSON.stringify(result[0].users));
			msg.sender_id = me;
			msg.receivers_id = [...groupUsers];

			const selfIdx = groupUsers.indexOf(me._id);
			if (selfIdx < 0) {
				return 0;
			}
			groupUsers.splice(selfIdx, 1);
			const newMessage = new Message(msg);
			yield newMessage.save();
			yield newMessage.populate('sender_id', 'username').execPopulate();
			newMessage.receivedReceivers_id = undefined;
			newMessage.seenReceivers_id = undefined;
			newMessage.receivers_id = undefined;
			for (let i = 0; i < groupUsers.length; i++) {
				if (io.adapter.rooms[`user:${groupUsers[i]}`]) {
					socket.to(`user:${groupUsers[i]}`).emit('message:receiveMsg', newMessage);
					Message.update({ _id: newMessage._id }, { $addToSet: { receivedReceivers_id: groupUsers[i] } }, (err) => {});
				} else {
					console.log('fcm');
				}
			}
			return ack(newMessage);
		}).catch((err) => {
			console.log(err);
		});
	});

	/**
	* @api {on} message:typing Receive typing status
	* @apiVersion 0.1.0
	* @apiGroup Chats
	* @apiSuccessExample {json} Success
	*    {
	*      group_id: '57c6d20a45886b802bb035ad',
	*      user: { _id: '57c6d20a45886b802bb035a2', username: 'fishGay1' }
	*    }
	*/

	/**
	* @api {emit} message:typing Send typing status
	* @apiVersion 0.1.0
	* @apiGroup Chats
	* @apiParam {ObjectId} group_id Group ID
	* @apiSuccessExample {json} Success
	*    true
	*/
	socket.on('message:typing', (msg, ack) => {
		co(function* () {
			const validation = Joi.validate(msg, {
				group_id: Joi.objectId()
			}, { stripUnknown: true, presence: 'required' });
			if (validation.error) {
				return ack(validation.error);
			}
			msg = validation.value;
			const result = yield User.aggregate([
				{ $match: { groups_id: objectId(msg.group_id) } },
				{ $group: { _id: null, users: { $addToSet: '$_id' } } }
			]).exec();
			if (!result || !result[0] || !result[0].users) {
				return ack(false);
			}
			const groupUsers = JSON.parse(JSON.stringify(result[0].users));
			const selfIdx = groupUsers.indexOf(me._id);
			if (selfIdx < 0) {
				return ack(false);
			}
			groupUsers.splice(selfIdx, 1);
			for (let i = 0; i < groupUsers.length; i++) {
				if (io.adapter.rooms[`user:${groupUsers[i]}`]) {
					socket.to(`user:${groupUsers[i]}`).emit('message:typing', { group_id: msg.group_id, user: { _id: me._id, username: me.username } });
				}
			}
			return ack(true);
		}).catch((err) => {
			console.log(err);
		});
	});

	/**
	* @api {emit} message:getMsg Get messages
	* @apiVersion 0.1.0
	* @apiGroup Chats
	* @apiParam {ObjectId} group_id Group ID
	* @apiParam {Object} [msg_id] Message ID object (Get recent 25 messages if omitted)
	* @apiParam {ObjectId} [msg_id._dollar_sign_lt] Message ID (limits to 25 results)
	* @apiParam {ObjectId} [msg_id._dollar_sign_gt] Message ID (limits to 200 results)
	* @apiSuccessExample {json} Success
	*    [{
	*      group_id: '57c6d20a45886b802bb035ad',
	*      txt: 'test',
	*      sender_id: { _id: '57c6d20a45886b802bb035a2', username: 'fishGay1' },
	*      _id: '57c6d20b45886b802bb035b6',
	*      sendAt: '2016-08-31T12:48:09.903Z',
	*      attachments: [],
	*      type: 'txt'
	*    }]
	*/

	socket.on('message:getMsg', (msg, ack) => {
		co(function* () {
			const validation = Joi.validate(msg, {
				group_id: Joi.objectId().required(),
				msg_id: {
					$lt: Joi.objectId().required(),
					$gt: Joi.objectId().required()
				}
			}, { stripUnknown: true });
			if (validation.error) {
				return ack(validation.error);
			}
			msg = validation.value;
			const user = yield User.findOne({ _id: me._id, groups_id: msg.group_id }, 'groups_id').lean().exec();
			if (!user) {
				return ack(false);
			}
			let messages = [];
			if (msg.msg_id) {
				if (msg.msg_id.$lt) {
					messages = yield Message.find({ _id: { $lt: msg.msg_id.$lt }, group_id: msg.group_id, receivers_id: me._id }, '-receivers_id -seenReceivers_id -receivedReceivers_id').populate('sender_id', 'username').sort({ _id: -1 }).limit(25).lean().exec();
				} else if (msg.msg_id.$gt) {
					messages = yield Message.find({ _id: { $gt: msg.msg_id.$gt }, group_id: msg.group_id, receivers_id: me._id }, '-receivers_id -seenReceivers_id -receivedReceivers_id').populate('sender_id', 'username').sort({ _id: -1 }).limit(200).lean().exec();
				} else {
					return ack(false);
				}
			} else {
				messages = yield Message.find({ group_id: msg.group_id, receivers_id: me._id }, '-receivers_id -seenReceivers_id -receivedReceivers_id').populate('sender_id', 'username').sort({ _id: -1 }).limit(25).lean().exec();
			}
			yield Message.update({ _id: { $in: messages }, receivedReceivers_id: { $ne: me._id } }, { $addToSet: { receivedReceivers_id: me._id } }, { multi: true }).exec();
			return ack(messages);
		}).catch((err) => {
			console.log(err);
		});
	});
};

module.exports = message;
