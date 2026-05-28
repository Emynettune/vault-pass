const SecurityLog = require('../models/SecurityLog');

// Log suspicious activity to MongoDB
exports.logSuspiciousActivity = async (req, res, next) => {
  // Store original send method
  const originalSend = res.send;
  
  res.send = async function(data) {
    // Log specific actions
    if (res.statusCode === 401 || res.statusCode === 403) {
      try {
        await SecurityLog.create({
          action: req.body.action || 'forbidden_access',
          user: req.user?._id || null,
          ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
          timestamp: new Date(),
          details: {
            route: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            error: req.body.error || 'Access denied'
          },
          userAgent: req.get('User-Agent')
        });
      } catch (error) {
        console.error('Error logging suspicious activity:', error.message);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Log specific actions manually
exports.logAction = async (action, userId, req, details = {}) => {
  try {
    await SecurityLog.create({
      action,
      user: userId,
      ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
      timestamp: new Date(),
      details,
      userAgent: req.get('User-Agent'),
      route: req.originalUrl,
      method: req.method
    });
  } catch (error) {
    console.error('Error logging action:', error.message);
  }
};