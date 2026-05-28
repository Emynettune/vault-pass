const User = require('../models/User');

// Check if user is locked before login attempt
exports.checkLockout = async (req, res, next) => {
  const { username } = req.body;
  
  if (!username) {
    return next();
  }

  try {
    const user = await User.findOne({ username });
    
    if (user && user.isAccountLocked()) {
      const lockedUntil = user.accountLocked.lockedUntil;
      const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
      
      return res.status(403).json({
        success: false,
        error: `Account is locked. Try again in ${minutesLeft} minutes.`,
        lockedUntil: lockedUntil
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};