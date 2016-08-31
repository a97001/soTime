const jwt = require('jsonwebtoken');

const messageCtrl = require('./message');

const User = require('../../models/user');

const versionInit = (io) => {
	io.on('connection', (socket) => {
		const query = socket.handshake.query;
		const me = JSON.parse(decodeURI(jwt.decode(query.token)));
		socket.join(`user:${me._id}`);
		messageCtrl(io, socket, query, me);
	});
};

module.exports = versionInit;
