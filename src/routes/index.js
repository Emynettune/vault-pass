const express = require('express');
const router = express.Router();

const publicRoutes = require('./public');
const userRoutes = require('./user');
const moderatorRoutes = require('./moderator');
const adminRoutes = require('./admin');
const { register, login, logout } = require('../controllers/authController');
const { checkLockout } = require('../middleware/lockout');
const { logSuspiciousActivity } = require('../middleware/suspiciousActivityLogger');

// Apply suspicious activity logger globally
router.use(logSuspiciousActivity);

// Auth routes (public)
router.post('/auth/register', register);
router.post('/auth/login', checkLockout, login);
router.post('/auth/logout', logout);

// Route mounting
router.use('/public', publicRoutes);
router.use('/user', userRoutes);
router.use('/moderator', moderatorRoutes);
router.use('/admin', adminRoutes);

module.exports = router;