const cluster = require('cluster');
const os = require('os');
const debug = require('debug')('express-mongoose-es6-rest-api:index');
// const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('./config/env');
const http = require('http');
const app = require('./config/express');
const socketio = require('socket.io');
const socketioJwt = require('socketio-jwt');
const mongoAdapter = require('socket.io-adapter-mongo');
const ioHandler = require('./server/socket.io');

if (process.env.NODE_ENV === 'production') {
  if (cluster.isMaster) {
    const numWorkers = os.cpus().length;

    console.log(`Master cluster setting up ${numWorkers} workers... `);

    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
      console.log('Starting a new worker');
      cluster.fork();
    });
  } else {
    init();
  }
} else {
  init();
}

function init() {
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

  // listen on port config.port
  server.listen(config.port, () => {
    debug(`server started on port ${config.port} (${config.env})`);
  });

  module.exports = app;
}
