const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { logAction } = require('../middleware/suspiciousActivityLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    const token = generateToken(user._id);

    await logAction('successful_login', user._id, req, { action: 'registration' });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username and password'
      });
    }

    // Get user with password field
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      await logAction('failed_login', null, req, { username, reason: 'user_not_found' });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockedUntil = user.accountLocked.lockedUntil;
      const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
      
      await logAction('failed_login', user._id, req, { reason: 'account_locked' });
      
      return res.status(403).json({
        success: false,
        error: `Account is locked. Try again in ${minutesLeft} minutes.`,
        lockedUntil
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      user.handleFailedLogin();
      await user.save();
      
      await logAction('failed_login', user._id, req, { 
        reason: 'wrong_password',
        failedAttempts: user.failedLoginAttempts.count
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        failedAttempts: user.failedLoginAttempts.count,
        isLocked: user.accountLocked.locked
      });
    }

    // Successful login - reset failed attempts
    user.resetFailedAttempts();
    user.unlockAccount();
    await user.save();

    const token = generateToken(user._id);

    await logAction('successful_login', user._id, req);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};