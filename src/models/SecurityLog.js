const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'failed_login',
      'forbidden_access',
      'account_deleted',
      'user_promoted',
      'successful_login',
      'unauthorized_access'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: Object,
    default: {}
  },
  userAgent: String,
  route: String,
  method: String
});

securityLogSchema.index({ timestamp: -1 });
securityLogSchema.index({ action: 1, timestamp: -1 });
securityLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);