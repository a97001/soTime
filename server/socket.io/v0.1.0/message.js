const User = require('../../models/user');
const Group = require('../../models/group');

const message = (socket) => {
	const query = socket.handshake.query;
	// if (query.group) {
	//
	// } else if (query.friendship) {
	//
	// } else {
	//
	// }
	//

	socket.on('joinGroup', (id, msg) => {
    console.log(id, msg);
	});
};

module.exports = message;
