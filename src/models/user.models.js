const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,

    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Exclude password from query results by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    resetAt: {
      type: Date,
      default: null,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    }, 
    otp: {
      type: String
    },
    otpExpiry: {
      type: Date
    }
  },
  { timestamps: true, versionKey: false },
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
    
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.resetFailedAttempts = function () {
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.lockedUntil = null;
  return this.save();
};

userSchema.methods.handleFailedLogin = function () {
  this.failedLoginAttempts++;
  if (this.failedLoginAttempts >= 5) {
    this.accountLocked = true;
    this.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
  }
  return this.save();
};
userSchema.methods.isAccountLocked = function () {
  if (!this.accountLocked) {
    return false;
  }
  if (this.lockedUntil && Date.now() < this.lockedUntil) {
    return true;
  }
  // If the lock has expired, unlock the account
  this.accountLocked = false;
  this.lockedUntil = null;
  return false;
};
userSchema.methods.unlockAccount = function () {
  this.accountLocked = false;
  this.lockedUntil = null;
  this.failedLoginAttempts = 0;
  return this.save();
}
const User = mongoose.model("User", userSchema);

module.exports = User;