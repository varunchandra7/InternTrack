const mongoose = require('mongoose');

/**
 * OTP Schema - Stores temporary OTPs for email verification and password reset
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'password-reset'],
    required: true
  },
  userData: {
    name: String,
    password: String,
    gender: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes (600 seconds)
  }
});

module.exports = mongoose.model('OTP', otpSchema);
