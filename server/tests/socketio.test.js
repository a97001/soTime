import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
// import { expect } from 'chai';
import app from '../../index';
import ioClient from 'socket.io-client';

chai.config.includeStack = true;

const socketURL = 'http://localhost:3000/v0.1.0';
const socketOptions = {
  transports: ['websocket'],
  'force new connection': true
};

// describe('## Socket.io', () => {
// 	describe('# Client connects to server without token', () => {
// 		it('should not be connected', (done) => {
//       const client = ioClient.connect(socketURL, socketOptions);
//       client.on('unauthorized', (data) => {
//         console.log(data);
//         done();
//       });
//       client.on('error', (data) => {
//         console.log(data);
//         done();
//       });
//       client.on('connect_error', (data) => {
//         console.log(data);
//         done();
//       });
//       client.on('connect', (data) => {
//         throw new Error('fail');
//         // done();
//       });
//       client.on('authenticated', (data) => {
//         throw new Error('fail');
//         // done();
//       });
// 			// request(app)
// 			// 	.get('/api/health-check')
// 			// 	.expect(httpStatus.OK)
// 			// 	.then(res => {
// 			// 		expect(res.text).to.equal('OK');
// 			// 		done();
// 			// 	});
// 		});
// 	});

	// describe('# GET /api/404', () => {
	// 	it('should return 404 status', (done) => {
	// 		request(app)
	// 			.get('/api/404')
	// 			.expect(httpStatus.NOT_FOUND)
	// 			.then(res => {
	// 				expect(res.body.message).to.equal('Not Found');
	// 				done();
	// 			});
	// 	});
	// });
// });
