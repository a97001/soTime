const express = require('express');
const v0_1_0 = require('./v0.1.0');

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
	res.send('OK')
);

// mount v0.1.0 routes at /v0.1.0
router.use('/v0.1.0', v0_1_0);

module.exports = router;
