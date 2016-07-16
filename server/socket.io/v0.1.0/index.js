const messageCtrl = require('./message');

const versionInit = (io) => {
	io.on('connection', (socket) => {
    messageCtrl(socket);
	});
};

module.exports = versionInit;
