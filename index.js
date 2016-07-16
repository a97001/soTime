const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('./config/env');
const http = require('http');
const app = require('./config/express');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');
const mongoAdapter = require('socket.io-adapter-mongo');
const ioHandler = require('./server/socket.io');

const server = http.createServer(app);
const io = socketio(server);
console.log(config.db);
io.adapter(mongoAdapter(config.db));
io.use(socketioJwt.authorize({
  secret: config.secret,
  handshake: true
}));
ioHandler(io);

// promisify mongoose
// Promise.promisifyAll(mongoose);

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
	throw new Error(`unable to connect to database: ${config.db}`);
});

const debug = require('debug')('express-mongoose-es6-rest-api:index');

// listen on port config.port
server.listen(config.port, () => {
	debug(`server started on port ${config.port} (${config.env})`);
});

module.exports = app;
