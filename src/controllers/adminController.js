const User = require('../models/User');
const { logAction } = require('../middleware/suspiciousActivityLogger');

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Prevent admin from deleting themselves
    if (currentUser._id.toString() === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete yourself. This is intentional.'
      });
    }

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting other admins
    if (userToDelete.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete another admin'
      });
    }

    await User.findByIdAndDelete(id);

    await logAction('account_deleted', id, req, {
      deletedBy: currentUser._id,
      deletedByUsername: currentUser.username,
      deletedUserRole: userToDelete.role
    });

    res.status(200).json({
      success: true,
      message: `User ${userToDelete.username} deleted successfully`,
      data: { deletedId: id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error deleting user'
    });
  }
};

// @desc    Promote user
// @route   POST /api/admin/promote/:id
// @access  Private (admin only)
exports.promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    // Validate role
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be user, moderator, or admin'
      });
    }

    const userToPromote = await User.findById(id);

    if (!userToPromote) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent promoting self
    if (currentUser._id.toString() === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot promote yourself'
      });
    }

    // Prevent promoting another admin to admin
    if (userToPromote.role === 'admin' && role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You cannot promote another admin to admin'
      });
    }

    // Prevent downgrading from admin without reason (optional)
    if (userToPromote.role === 'admin' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot downgrade an admin without proper authorization'
      });
    }

    userToPromote.role = role;
    await userToPromote.save();

    await logAction('user_promoted', id, req, {
      promotedBy: currentUser._id,
      promotedByUsername: currentUser.username,
      newRole: role,
      previousRole: userToPromote.role
    });

    res.status(200).json({
      success: true,
      message: `User ${userToPromote.username} promoted to ${role}`,
      data: {
        id: userToPromote._id,
        username: userToPromote.username,
        role: userToPromote.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error promoting user'
    });
  }
};

// @desc    Get all users (admin view with more details)
// @route   GET /api/admin/users
// @access  Private (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

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

// @desc    Get security logs
// @route   GET /api/admin/logs
// @access  Private (admin only)
exports.getSecurityLogs = async (req, res) => {
  try {
    const { action, limit = 100 } = req.query;
    
    const query = action ? { action } : {};
    
    const logs = await SecurityLog.find(query)
      .populate('user', 'username email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error fetching logs'
    });
  }
};