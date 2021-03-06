const Joi = require('joi');
const joiObjectid = require('joi-objectid');

Joi.objectId = joiObjectid(Joi);

const voteSchema = {
	options: {
		allowUnknownParams: false,
	},
	body: {
		startDate: Joi.date().iso().required(),
		endDate: Joi.date().min(Joi.ref('startDate')).iso().required()
	}
};

module.exports = {
	// POST /users
	createUser: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			email: Joi.string().email().required(),
			username: Joi.string().min(1).max(20).required(),
			password: Joi.string().min(8).max(20).required(),
			invitation: Joi.objectId().optional()
		}
	},

	// POST /users/login
	localLogin: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			email: Joi.string().email().required(),
			password: Joi.string().required()
		}
	},

	// POST /users/logout
	logoutUser: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			clientId: Joi.objectId().required()
		}
	},

	// POST /users/token
	refreshAccessToken: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			clientId: Joi.objectId().required(),
			refreshToken: Joi.string().required()
		}
	},

	// GET /users/:userId/events
	showUserEvents: {
		options: {
			allowUnknownParams: false,
		},
		query: {
			from: Joi.date().iso().required(),
			to: Joi.date().iso().required(),
			type: Joi.string()
		}
	},

	// POST /users/:userId/events
	createUserEvent: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			title: Joi.string().min(1).max(50).required(),
			description: Joi.string().allow('').required(),
			type: Joi.string().required(),
			startTime: Joi.date().iso().required(),
			allDay: Joi.boolean().required(),
			endTime: Joi.date().iso().required(),
			venue: {
				coordinates: {
					lat: Joi.number(),
					lon: Joi.number()
				},
				name: Joi.string()
			},
			isPublic: Joi.boolean().required()
		}
	},

	// PUT /users/:userId/events/:eventId
	updateUserEvent: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			title: Joi.string().min(1).max(50).required(),
			description: Joi.string().allow('').required(),
			type: Joi.string().required(),
			startTime: Joi.date().iso().required(),
			allDay: Joi.boolean().required(),
			endTime: Joi.date().iso().required(),
			venue: {
				coordinates: {
					lat: Joi.number(),
					lon: Joi.number()
				},
				name: Joi.string()
			},
			isPublic: Joi.boolean().required()
		}
	},

	// POST /groups
	createGroup: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			name: Joi.string().min(1).max(50).required(),
			isPublic: Joi.boolean().required()
		}
	},

	// PUT /groups/:groupId
	updateGroup: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			name: Joi.string().min(1).max(50).required(),
			isPublic: Joi.boolean().required()
		}
	},

	// POST /groups/:groupId/invitations
	inviteGroupMember: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			user: Joi.objectId().required()
		}
	},

	// GET /groups/:groupId/events
	showGroupEvents: {
		options: {
			allowUnknownParams: false,
		},
		query: {
			from: Joi.date().iso().required(),
			to: Joi.date().iso().required(),
			type: Joi.string()
		}
	},

	// POST /groups/:groupId/events
	createGroupEvent: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			title: Joi.string().min(1).max(50).required(),
			description: Joi.string().allow('').required(),
			type: Joi.string().required(),
			startTime: Joi.date().iso().required(),
			allDay: Joi.boolean().required(),
			endTime: Joi.date().iso().required(),
			venue: {
				coordinates: {
					lat: Joi.number(),
					lon: Joi.number()
				},
				name: Joi.string()
			},
			isPublic: Joi.boolean().required()
		}
	},

	// PUT /groups/:groupId/events/:eventId
	updateGroupEvent: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			title: Joi.string().min(1).max(50).required(),
			description: Joi.string().allow('').required(),
			type: Joi.string().required(),
			startTime: Joi.date().iso().required(),
			allDay: Joi.boolean().required(),
			endTime: Joi.date().iso().required(),
			venue: {
				coordinates: {
					lat: Joi.number(),
					lon: Joi.number()
				},
				name: Joi.string()
			},
			isPublic: Joi.boolean().required()
		}
	},

	// POST /groups/:groupId/events/:eventId/votes
	createGroupEventVote: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			description: Joi.string().allow('').required(),
			dateOptions: Joi.array().items(Joi.compile(voteSchema).required()).required(),
			startDate: Joi.date().iso().required(),
			endDate: Joi.date().min(Joi.ref('startDate')).iso().required(),
			isAnonymous: Joi.boolean().required(),
			isPublic: Joi.boolean().required()
		}
	},

	// PUT /groups/:groupId/events/:eventId/votes/current/response
	updateGroupEventCurrentVoteResponse: {
		options: {
			allowUnknownParams: false,
		},
		body: {
			option: Joi.objectId().required()
		}
	},

	// GET /events
	showEvents: {
		options: {
			allowUnknownParams: false,
		},
		query: {
			from: Joi.date().iso().required(),
			to: Joi.date().iso().required(),
			type: Joi.string(),
			title: Joi.string(),
			skip: Joi.number()
		}
	}

	// // UPDATE /api/users/:userId
	// updateUser: {
	// 	body: {
	// 		username: Joi.string().required(),
	// 		mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
	// 	},
	// 	params: {
	// 		userId: Joi.string().hex().required()
	// 	}
	// }
};
