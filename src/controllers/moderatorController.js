const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

// @desc    Get reports
// @route   GET /api/moderator/reports
// @access  Private (moderator & admin only)
exports.getReports = async (req, res) => {
  try {
    const reports = await SecurityLog.find({
      action: { $in: ['failed_login', 'forbidden_access', 'unauthorized_access'] }
    })
    .populate('user', 'username email role')
    .sort({ timestamp: -1 })
    .limit(100);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error fetching reports'
    });
  }
};

// @desc    Get all users (moderator view)
// @route   GET /api/moderator/users
// @access  Private (moderator & admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').select('+failedLoginAttempts');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error fetching users'
    });
  }
};