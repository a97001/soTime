import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import app from '../../index';
const co = require('co');
const jwt = require('jsonwebtoken');

chai.config.includeStack = true;

const expect = chai.expect;
const should = chai.should();

const User = require('../models/user');
const Event = require('../models/event');
const Group = require('../models/group');

describe('## User APIs', () => {
	const me = {
		username: 'fishGay',
		email: 'fishgay@gmail.com',
    password: '77889900'
	};
	let decodedMe = null;
	let credential = null;
	let event = null;
	let group = null;

	describe('## Users', () => {
		describe('# POST /v0.1.0/users', () => {
			it('should create a new user', (done) => {
				request(app)
					.post('/v0.1.0/users')
					.send(me)
					.expect(httpStatus.OK)
					.then(res => {
						credential = res.body;
						// expect(res.body.username).to.equal(user.username);
						// expect(res.body.mobileNumber).to.equal(user.mobileNumber);
						// user = res.body;
						done();
					});
			});
		});

		describe('# GET /v0.1.0/users/login', () => {
			it('should login user', (done) => {
				request(app)
				.post('/v0.1.0/users/login')
				.send({ email: me.email, password: me.password })
				.expect(httpStatus.OK)
				.then(res => {
					should.exist(res.body.accessToken);
					let decoded = jwt.decode(res.body.accessToken);
					decoded = decodeURI(decoded);
					decodedMe = JSON.parse(decoded);
					done();
				});
			});
		});

		describe('# GET /v0.1.0/users/token', () => {
			it('should refresh access token', (done) => {
				request(app)
				.post('/v0.1.0/users/token')
				// .set('Authorization', `Bearer ${credential.accessToken}`)
				.send({ clientId: credential.clientId, refreshToken: credential.refreshToken })
				.expect(httpStatus.OK)
				.then(res => {
					should.exist(res.body.accessToken);
					done();
				});
			});
		});

		describe('# PUT /v0.1.0/users/me/icon', () => {
			it('should update user icon', (done) => {
				request(app)
				.put('/v0.1.0/users/me/icon')
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.send({ uploadedDocs: [{ name: 'icon1.jpg', type: 'jpg' }] })
				.expect(httpStatus.CREATED)
				.then(res => {
					should.exist(res.body.icon);
					decodedMe.icon = res.body.icon;
					done();
				});
			});
		});

		describe('# GET /v0.1.0/users/:userId/icon/:iconId', () => {
			it('should get user icon', (done) => {
				request(app)
				.get(`/v0.1.0/users/${decodedMe._id}/icon/${decodedMe.icon}`)
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.expect(httpStatus.OK)
				.then(res => {
					done();
				});
			});
		});

		describe('# GET /v0.1.0/users/logout', () => {
			it('should logout user', (done) => {
				request(app)
				.post('/v0.1.0/users/logout')
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.send({ clientId: credential.clientId })
				.expect(httpStatus.NO_CONTENT)
				.then(res => {
					done();
				});
			});
		});

		describe('# POST /v0.1.0/users/me/events', () => {
			it('should create user event', (done) => {
				request(app)
				.post('/v0.1.0/users/me/events')
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.send({
					title: 'fishGay is gay',
					description: 'fishGay is very gay',
					type: 'gay',
					startTime: new Date(),
					allDay: false,
					endTime: new Date(),
					venue: {
						coordinates: {
							lat: 0,
							lon: 0
						},
						name: 'Home'
					},
					isPublic: true
				})
				.expect(httpStatus.CREATED)
				.then(res => {
					should.exist(res.body._id);
					event = res.body;
					done();
				});
			});
		});

		describe('# GET /v0.1.0/users/:userId/events', () => {
			it('should get user events', (done) => {
				request(app)
				.get(`/v0.1.0/users/${decodedMe._id}/events`)
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.query({
					from: new Date(99, 5, 24),
					to: new Date()
				})
				.expect(httpStatus.OK)
				.then(res => {
					expect(res.body).to.have.length.above(0);
					done();
				});
			});
		});

		describe('# PUT /v0.1.0/users/me/events/:eventId', () => {
			it('should update user event', (done) => {
				request(app)
				.put(`/v0.1.0/users/me/events/${event._id}`)
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.send({
					title: 'fishGay is very gay',
					description: 'fishGay is very gay',
					type: 'gay',
					startTime: new Date(),
					allDay: false,
					endTime: new Date(),
					venue: {
						coordinates: {
							lat: 0,
							lon: 0
						},
						name: 'Home'
					},
					isPublic: true
				})
				.expect(httpStatus.OK)
				.then(res => {
					should.exist(res.body._id);
					expect(res.body.title).to.equal('fishGay is very gay');
					done();
				});
			});
		});

		describe('# DELETE /v0.1.0/users/me/events/:eventId', () => {
			it('should delete user event', (done) => {
				request(app)
				.delete(`/v0.1.0/users/me/events/${event._id}`)
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.expect(httpStatus.OK)
				.then(res => {
					should.exist(res.body._id);
					expect(res.body._id).to.equal(event._id);
					done();
				});
			});
		});

	//
	// 		it('should report error with message - Not found, when user does not exists', (done) => {
	// 			request(app)
	// 				.get('/api/v0.1.0/users/56c787ccc67fc16ccc1a5e92')
	// 				.expect(httpStatus.NOT_FOUND)
	// 				.then(res => {
	// 					expect(res.body.message).to.equal('Not Found');
	// 					done();
	// 				});
	// 		});
	// 	});
	//
	// 	describe('# PUT /api/v0.1.0/users/:userId', () => {
	// 		it('should update user details', (done) => {
	// 			user.username = 'KK';
	// 			request(app)
	// 				.put(`/api/v0.1.0/users/${user._id}`)
	// 				.send(user)
	// 				.expect(httpStatus.OK)
	// 				.then(res => {
	// 					expect(res.body.username).to.equal('KK');
	// 					expect(res.body.mobileNumber).to.equal(user.mobileNumber);
	// 					done();
	// 				});
	// 		});
	// 	});
	//
	// 	describe('# GET /api/v0.1.0/users/', () => {
	// 		it('should get all users', (done) => {
	// 			request(app)
	// 				.get('/api/v0.1.0/users')
	// 				.expect(httpStatus.OK)
	// 				.then(res => {
	// 					expect(res.body).to.be.an('array');
	// 					done();
	// 				});
	// 		});
	// 	});
	//
	// 	describe('# DELETE /api/v0.1.0/users/', () => {
	// 		it('should delete user', (done) => {
	// 			request(app)
	// 				.delete(`/api/v0.1.0/users/${user._id}`)
	// 				.expect(httpStatus.OK)
	// 				.then(res => {
	// 					expect(res.body.username).to.equal('KK');
	// 					expect(res.body.mobileNumber).to.equal(user.mobileNumber);
	// 					done();
	// 				});
	// 		});
	// 	});
	});
	describe('## Groups', () => {
		describe('# POST /v0.1.0/groups', () => {
			it('should create group', (done) => {
				request(app)
				.post('/v0.1.0/groups')
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.send({
					name: 'fishGay is gay',
					isPublic: false
				})
				.expect(httpStatus.CREATED)
				.then(res => {
					should.exist(res.body._id);
					group = res.body;
					done();
				});
			});
		});

		describe('# GET /v0.1.0/users/me/groups', () => {
			it('should get groups of users', (done) => {
				request(app)
				.get('/v0.1.0/users/me/groups')
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.expect(httpStatus.OK)
				.then(res => {
					expect(res.body).to.have.length.above(0);
					done();
				});
			});
		});

		describe('# PUT /v0.1.0/groups/:groupId', () => {
			it('should update group', (done) => {
				request(app)
				.put(`/v0.1.0/groups/${group._id}`)
				.set('Authorization', `Bearer ${credential.accessToken}`)
				.send({
					name: 'fishGay is very gay',
					isPublic: false
				})
				.expect(httpStatus.OK)
				.then(res => {
					should.exist(res.body._id);
					expect(res.body.name).to.equal('fishGay is very gay');
					done();
				});
			});
		});
	});

	after(() => {
		User.remove({ email: me.email }, (err) => {
		});
		Event.remove({}, (err) => {
		});
		Group.remove({}, (err) => {
		});
	});
});
