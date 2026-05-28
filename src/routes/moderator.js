const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getReports, getAllUsers } = require('../controllers/moderatorController');

// All routes require authentication + moderator or admin role
router.use(protect);
router.use(authorize('moderator', 'admin'));

router.get('/reports', getReports);
router.get('/users', getAllUsers);

module.exports = router;