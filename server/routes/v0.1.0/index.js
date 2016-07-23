const express = require('express');
const userRoutes = require('./user');
const groupRoutes = require('./group');
const eventRoutes = require('./event');
const uploadRoutes = require('./upload');

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
	res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/events', eventRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
