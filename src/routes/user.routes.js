const express = require('express');
const { signUp, signIn, makeAdmin, getAllUsers, verifyEmail, resendOtp } = require('../controllers/user.controllers');
const isAuthentication = require('../utils/isAuthentication');
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profile.controllers');

router.use(protect); // Apply authentication middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post("/signup", signUp)
router.post("/signin", signIn)
router.patch("/verify-email", verifyEmail)
router.post("/resend-otp", resendOtp)
router.patch("/new-admin/:userId", makeAdmin)
router.get("/all-users", isAuthentication, getAllUsers)


module.exports = router;