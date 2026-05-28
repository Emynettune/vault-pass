const express = require('express');
const router = express.Router();
const { getMessage } = require('../controllers/publicController');

// Public route - no authentication required
router.get('/message', getMessage);

module.exports = router;