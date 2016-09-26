const v0_1_0 = require('./v0.1.0');

const init = (io) => {
	v0_1_0(io.of('/v0.1.0/chat'));
};

module.exports = init;
