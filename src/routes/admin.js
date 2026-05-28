const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { deleteUser, promoteUser, getAllUsers, getSecurityLogs } = require('../controllers/adminController');

// All routes require authentication + admin role ONLY
router.use(protect);
router.use(authorize('admin'));

router.delete('/user/:id', deleteUser);
router.post('/promote/:id', promoteUser);
router.get('/users', getAllUsers);
router.get('/logs', getSecurityLogs);

module.exports = router;